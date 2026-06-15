import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Validation error", issues: err.issues });
  }

  return res.status(500).json({ message: "Internal server error" });
};
