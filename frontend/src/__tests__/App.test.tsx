import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { store } from "../store";

describe("App", () => {
  it("renders login page by default route", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
