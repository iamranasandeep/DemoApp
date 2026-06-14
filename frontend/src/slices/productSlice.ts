import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { LiveInventory, Product } from "../types";

interface ProductState {
  products: Product[];
  selectedLiveInventory: LiveInventory | null;
  loading: boolean;
}

const initialState: ProductState = {
  products: [],
  selectedLiveInventory: null,
  loading: false
};

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (payload: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get("/api/products", { params: payload });
    return response.data as { data: Product[] };
  }
);

export const fetchLiveInventory = createAsyncThunk(
  "products/fetchLiveInventory",
  async (productId: number) => {
    const response = await api.get(`/api/inventory/live/${productId}`);
    return response.data as LiveInventory;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchLiveInventory.fulfilled, (state, action) => {
        state.selectedLiveInventory = action.payload;
      });
  }
});

export default productSlice.reducer;
