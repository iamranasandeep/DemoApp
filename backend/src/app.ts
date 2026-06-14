import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes";
import { productRouter } from "./routes/productRoutes";
import { inventoryRouter } from "./routes/inventoryRoutes";
import { warehouseRouter } from "./routes/warehouseRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/warehouses", warehouseRouter);

app.use(errorHandler);

export { app };
