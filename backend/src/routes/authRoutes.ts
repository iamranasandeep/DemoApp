import { Router } from "express";
import { login, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);

export { authRouter };
