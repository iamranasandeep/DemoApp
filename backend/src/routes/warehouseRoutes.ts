import { Router } from "express";
import { listWarehouses } from "../controllers/warehouseController";

const warehouseRouter = Router();

warehouseRouter.get("/", listWarehouses);

export { warehouseRouter };
