import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import warehouseReducer from "./slices/warehouseSlice";
import toastReducer from "./slices/toastSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    warehouses: warehouseReducer,
    toast: toastReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
