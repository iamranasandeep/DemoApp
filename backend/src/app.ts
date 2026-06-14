import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "./config/env";
import { query } from "./db/pool";

const app = express();
const revokedTokens = new Set<string>();

app.use(cors());
app.use(express.json());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  const token = header.slice(7);
  if (revokedTokens.has(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { sub: number; username: string };
    (req as Request & { user?: { id: number; username: string }; token?: string }).user = {
      id: Number(decoded.sub),
      username: decoded.username
    };
    (req as Request & { user?: { id: number; username: string }; token?: string }).token = token;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const body = z.object({ username: z.string().min(1), password: z.string().min(1) }).parse(req.body);

    const userResult = await query("SELECT id, username, password_hash FROM users WHERE username = $1", [body.username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0] as { id: number; username: string; password_hash: string };
    const passwordValid = await bcrypt.compare(body.password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", authMiddleware, (req, res) => {
  const token = (req as Request & { token?: string }).token;
  if (token) {
    revokedTokens.add(token);
  }
  res.json({ message: "Logged out" });
});

app.post("/api/products", authMiddleware, async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      description: z.string().default(""),
      categoryId: z.number().int().positive()
    }).parse(req.body);

    const productResult = await query(
      "INSERT INTO products(name, description, category_id) VALUES ($1, $2, $3) RETURNING id, name, description, category_id",
      [body.name, body.description, body.categoryId]
    );

    res.status(201).json(productResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || "").trim();
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    if (categoryId) {
      params.push(categoryId);
      where.push(`p.category_id = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM products p ${whereSql}`, params);

    params.push(limit, offset);
    const rowsResult = await query(
      `SELECT p.id, p.name, p.description, p.category_id, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${whereSql}
       ORDER BY p.id
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: rowsResult.rows,
      meta: {
        page,
        limit,
        total: Number(countResult.rows[0]?.total || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/inventory/movements", authMiddleware, async (req, res, next) => {
  try {
    const body = z.object({
      productId: z.number().int().positive(),
      warehouseId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      movementType: z.enum(["IN", "OUT"])
    }).parse(req.body);

    if (body.movementType === "OUT") {
      const stockResult = await query(
        "SELECT quantity FROM inventory WHERE product_id = $1 AND warehouse_id = $2",
        [body.productId, body.warehouseId]
      );

      const currentQty = Number(stockResult.rows[0]?.quantity || 0);
      if (currentQty < body.quantity) {
        return res.status(400).json({ message: "Insufficient quantity for stock OUT" });
      }
    }

    await query(
      `INSERT INTO inventory(product_id, warehouse_id, quantity)
       VALUES($1, $2, $3)
       ON CONFLICT(product_id, warehouse_id)
       DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
      [body.productId, body.warehouseId, body.movementType === "IN" ? body.quantity : -body.quantity]
    );

    await query(
      "INSERT INTO stock_movements(product_id, warehouse_id, movement_type, quantity, performed_by) VALUES($1, $2, $3, $4, $5)",
      [body.productId, body.warehouseId, body.movementType, body.quantity, (req as Request & { user?: { id: number } }).user?.id || null]
    );

    return res.status(201).json({ message: "Movement recorded" });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/inventory/live/:productId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    const stockResult = await query(
      `SELECT w.id AS warehouse_id, w.name AS warehouse_name, COALESCE(i.quantity, 0) AS quantity
       FROM warehouses w
       LEFT JOIN inventory i ON i.warehouse_id = w.id AND i.product_id = $1
       ORDER BY w.id`,
      [productId]
    );

    const totalQuantity = stockResult.rows.reduce((sum: number, row: { quantity: number }) => sum + Number(row.quantity), 0);

    return res.json({
      productId,
      warehouses: stockResult.rows,
      totalQuantity
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/inventory/history/:productId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const rowsResult = await query(
      `SELECT sm.id, sm.movement_type, sm.quantity, sm.created_at, w.name AS warehouse_name
       FROM stock_movements sm
       JOIN warehouses w ON w.id = sm.warehouse_id
       WHERE sm.product_id = $1
       ORDER BY sm.created_at DESC`,
      [productId]
    );

    return res.json(rowsResult.rows);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/warehouses", async (_req, res, next) => {
  try {
    const rowsResult = await query("SELECT id, code, name FROM warehouses ORDER BY id");
    return res.json(rowsResult.rows);
  } catch (error) {
    return next(error);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Validation error", issues: err.issues });
  }

  return res.status(500).json({ message: "Internal server error" });
});

export { app };
