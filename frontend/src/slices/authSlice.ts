import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, setAuthToken } from "../services/api";

interface AuthState {
  token: string | null;
  username: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  username: null,
  loading: false,
  error: null
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { username: string; password: string }) => {
    const response = await api.post("/api/auth/login", payload);
    return response.data as { token: string; user: { username: string } };
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/api/auth/logout");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.user.username;
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.error = "Login failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.username = null;
        setAuthToken(undefined);
      });
  }
});

export default authSlice.reducer;
