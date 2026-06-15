import { Router } from "express";
import { createProduct, listProducts } from "../controllers/productController";
import { authMiddleware } from "../middleware/auth";

const productRouter = Router();

productRouter.post("/", authMiddleware, createProduct);
productRouter.get("/", listProducts);

export { productRouter };
