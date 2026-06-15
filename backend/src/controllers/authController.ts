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

    const token = jwt.sign({ sub: user.id, username: user.username }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
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
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate the input data using Zod
    const body = z.object({ 
      username: z.string().min(1), 
      password: z.string().min(1) 
    }).parse(req.body);

    // 2. Check if the username already exists in the database
    const userCheck = await query("SELECT id FROM users WHERE username = $1", [body.username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // 3. Hash the plain text password securely
    const saltRounds = 10; // Adjust this number based on your configuration
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    // 4. Insert the new user into the database
    const insertResult = await query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username", 
      [body.username, passwordHash]
    );
    
    const newUser = insertResult.rows[0] as { id: number; username: string };

    // 5. Generate a JWT token for the new user so they are logged in right away
    const token = jwt.sign(
      { sub: newUser.id, username: newUser.username }, 
      env.jwtSecret, 
      { expiresIn:env.jwtExpiresIn as any }
    );

    // 6. Return the token and user data
    return res.status(211).json({ 
      token, 
      user: { id: newUser.id, username: newUser.username } 
    });

  } catch (error) {
    // Pass any errors to your error handling middleware
    return next(error);
  }
};
