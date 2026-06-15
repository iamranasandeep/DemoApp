import { NextFunction, Request, Response } from "express";
import { query } from "../db/pool";

export const listWarehouses = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rowsResult = await query("SELECT id, code, name FROM warehouses ORDER BY id");
    return res.json(rowsResult.rows);
  } catch (error) {
    return next(error);
  }
};
