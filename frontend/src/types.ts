export interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name?: string;
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
