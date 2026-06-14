import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { query } from "../db/pool";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
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

    return res.status(201).json(productResult.rows[0]);
  } catch (error) {
    return next(error);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
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

    return res.json({
      data: rowsResult.rows,
      meta: {
        page,
        limit,
        total: Number(countResult.rows[0]?.total || 0)
      }
    });
  } catch (error) {
    return next(error);
  }
};
