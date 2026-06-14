import reducer from "../slices/authSlice";
import { AnyAction } from "@reduxjs/toolkit";

describe("authSlice", () => {
  it("returns initial state", () => {
    const state = reducer(undefined, { type: "unknown" } as AnyAction);

    expect(state.token).toBeNull();
    expect(state.username).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("handles login success", () => {
    const action = {
      type: "auth/login/fulfilled",
      payload: { token: "abc", user: { username: "admin" } }
    } as AnyAction;

    const state = reducer(undefined, action);

    expect(state.token).toBe("abc");
    expect(state.username).toBe("admin");
  });
});
