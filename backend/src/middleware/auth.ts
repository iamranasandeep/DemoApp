import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const revokedTokens = new Set<string>();

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
    (req as Request & { token?: string }).token = token;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const revokeToken = (token: string) => {
  revokedTokens.add(token);
};
