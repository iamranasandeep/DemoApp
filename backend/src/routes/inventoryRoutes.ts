import { Router } from "express";
import {
  createBulkMovements,
  createMovement,
  getLiveInventory,
  getProductHistory
} from "../controllers/inventoryController";
import { authMiddleware } from "../middleware/auth";

const inventoryRouter = Router();

inventoryRouter.post("/movements", authMiddleware, createMovement);
inventoryRouter.post("/movements/bulk", authMiddleware, createBulkMovements);
inventoryRouter.get("/live/:productId", getLiveInventory);
inventoryRouter.get("/history/:productId", getProductHistory);

export { inventoryRouter };
