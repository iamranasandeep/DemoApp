import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: []
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = Date.now().toString();
      state.toasts.push({
        id,
        ...action.payload,
        duration: action.payload.duration || 3000
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    }
  }
});

export const { showToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;
