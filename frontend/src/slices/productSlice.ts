import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { LiveInventory, Product, StockMovementPayload } from "../types";

interface ProductState {
  products: Product[];
  selectedLiveInventory: LiveInventory | null;
  loading: boolean;
  actionMessage: string | null;
  actionError: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedLiveInventory: null,
  loading: false,
  actionMessage: null,
  actionError: null
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

export const createProduct = createAsyncThunk(
  "products/create",
  async (payload: { name: string; description: string; categoryId: number }) => {
    const response = await api.post("/api/products", payload);
    return response.data as Product;
  }
);

export const createMovement = createAsyncThunk(
  "products/createMovement",
  async (payload: StockMovementPayload) => {
    const response = await api.post("/api/inventory/movements", payload);
    return response.data as { message: string };
  }
);

export const createBulkMovements = createAsyncThunk(
  "products/createBulkMovements",
  async (payload: { movements: StockMovementPayload[] }) => {
    const response = await api.post("/api/inventory/movements/bulk", payload);
    return response.data as { message: string; count: number };
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.actionMessage = null;
      state.actionError = null;
    }
  },
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
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.actionMessage = "Product created successfully";
        state.actionError = null;
      })
      .addCase(createMovement.fulfilled, (state, action) => {
        state.actionMessage = action.payload.message;
        state.actionError = null;
      })
      .addCase(createBulkMovements.fulfilled, (state, action) => {
        state.actionMessage = `${action.payload.message} (${action.payload.count})`;
        state.actionError = null;
      })
      .addCase(createMovement.rejected, (state) => {
        state.actionError = "Unable to record movement";
      })
      .addCase(createBulkMovements.rejected, (state) => {
        state.actionError = "Unable to record bulk movement";
      });
  }
});

export const { clearMessages } = productSlice.actions;
export default productSlice.reducer;
