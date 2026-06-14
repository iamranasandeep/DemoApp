import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { Warehouse } from "../types";

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
}

const initialState: WarehouseState = {
  warehouses: [],
  loading: false
};

export const fetchWarehouses = createAsyncThunk("warehouses/fetch", async () => {
  const response = await api.get("/api/warehouses");
  return response.data as Warehouse[];
});

const warehouseSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default warehouseSlice.reducer;
