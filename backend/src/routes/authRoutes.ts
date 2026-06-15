import { Router } from "express";
import { login, logout,signup } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.post("/signup", authMiddleware, signup);

export { authRouter };
