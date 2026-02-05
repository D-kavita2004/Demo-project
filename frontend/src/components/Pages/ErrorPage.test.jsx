import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ErrorPage from "./ErrorPage";

describe("ErrorPage Component", () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );

  it("renders 404 title and main text", () => {
    setup();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The page you are looking for doesn’t exist, or it may have been moved."
      )
    ).toBeInTheDocument();
  });

  it("renders Go to Homepage button", () => {
    setup();
    const homeButton = screen.getByRole("button", { name: /go to homepage/i });
    expect(homeButton).toBeInTheDocument();
  });

  it("renders Back to Login button", () => {
    setup();
    const loginButton = screen.getByRole("button", { name: /back to login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it("homepage button navigates to '/'", async () => {
    setup();
    const homeButton = screen.getByRole("button", { name: /go to homepage/i });
    expect(homeButton.closest("a")).toHaveAttribute("href", "/");
  });

  it("login button navigates to '/login'", async () => {
    setup();
    const loginButton = screen.getByRole("button", { name: /back to login/i });
    expect(loginButton.closest("a")).toHaveAttribute("href", "/login");
  });

});
