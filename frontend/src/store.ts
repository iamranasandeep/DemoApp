import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import warehouseReducer from "./slices/warehouseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    warehouses: warehouseReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
