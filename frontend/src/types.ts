export interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
}

export interface StockMovementPayload {
  productId: number;
  warehouseId: number;
  quantity: number;
  movementType: "IN" | "OUT";
}

export interface WarehouseStock {
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
}

export interface LiveInventory {
  productId: number;
  warehouses: WarehouseStock[];
  totalQuantity: number;
}
