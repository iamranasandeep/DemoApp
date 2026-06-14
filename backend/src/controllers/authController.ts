import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db/pool";
import { env } from "../config/env";
import { revokeToken } from "../middleware/auth";

export const login = async (req: Request, res: Response, next: NextFunction) => {
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
};

export const logout = (req: Request, res: Response) => {
  const token = (req as Request & { token?: string }).token;
  if (token) {
    revokeToken(token);
  }
  return res.json({ message: "Logged out" });
};
