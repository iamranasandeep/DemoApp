import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { query } from "../db/pool";

const movementSchema = z.object({
  productId: z.number().int().positive(),
  warehouseId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  movementType: z.enum(["IN", "OUT"])
});

const ensureStockForOut = async (productId: number, warehouseId: number, quantity: number) => {
  const stockResult = await query(
    "SELECT quantity FROM inventory WHERE product_id = $1 AND warehouse_id = $2",
    [productId, warehouseId]
  );

  const currentQty = Number(stockResult.rows[0]?.quantity || 0);
  return currentQty >= quantity;
};

const applyMovement = async (
  movement: z.infer<typeof movementSchema>,
  userId: number | null
) => {
  const signedQty = movement.movementType === "IN" ? movement.quantity : -movement.quantity;

  await query(
    `INSERT INTO inventory(product_id, warehouse_id, quantity)
     VALUES($1, $2, $3)
     ON CONFLICT(product_id, warehouse_id)
     DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
    [movement.productId, movement.warehouseId, signedQty]
  );

  await query(
    "INSERT INTO stock_movements(product_id, warehouse_id, movement_type, quantity, performed_by) VALUES($1, $2, $3, $4, $5)",
    [movement.productId, movement.warehouseId, movement.movementType, movement.quantity, userId]
  );
};

export const createMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = movementSchema.parse(req.body);

    if (body.movementType === "OUT") {
      const hasStock = await ensureStockForOut(body.productId, body.warehouseId, body.quantity);
      if (!hasStock) {
        return res.status(400).json({ message: "Insufficient quantity for stock OUT" });
      }
    }

    await applyMovement(body, (req as Request & { user?: { id: number } }).user?.id || null);
    return res.status(201).json({ message: "Movement recorded" });
  } catch (error) {
    return next(error);
  }
};

export const createBulkMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      movements: z.array(movementSchema).min(1)
    }).parse(req.body);

    for (const movement of body.movements) {
      if (movement.movementType === "OUT") {
        const hasStock = await ensureStockForOut(movement.productId, movement.warehouseId, movement.quantity);
        if (!hasStock) {
          return res.status(400).json({
            message: `Insufficient quantity for stock OUT on product ${movement.productId} in warehouse ${movement.warehouseId}`
          });
        }
      }
    }

    const userId = (req as Request & { user?: { id: number } }).user?.id || null;
    for (const movement of body.movements) {
      await applyMovement(movement, userId);
    }

    return res.status(201).json({ message: "Bulk movements recorded", count: body.movements.length });
  } catch (error) {
    return next(error);
  }
};

export const getLiveInventory = async (req: Request, res: Response, next: NextFunction) => {
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
    return res.json({ productId, warehouses: stockResult.rows, totalQuantity });
  } catch (error) {
    return next(error);
  }
};

export const getProductHistory = async (req: Request, res: Response, next: NextFunction) => {
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
};
