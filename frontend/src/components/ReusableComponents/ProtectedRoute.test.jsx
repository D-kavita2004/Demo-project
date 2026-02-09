import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../Utils/userContext";
import ProtectedRoute from "./ProtectedRoute";


/* =====================================================
   MOCK Navigate FROM react-router-dom
===================================================== */

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div>Redirected to {to}</div>,
  };
});

/* =====================================================
   HELPER RENDER FUNCTION
===================================================== */

const renderProtectedRoute = ({ user, loading }) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, loading }}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </UserContext.Provider>
    </MemoryRouter>
  );
};

/* =====================================================
   TEST SUITE
===================================================== */

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading text when loading is true", () => {
    renderProtectedRoute({ user: null, loading: true });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    renderProtectedRoute({ user: null, loading: false });

    expect(
      screen.getByText("Redirected to /login")
    ).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    renderProtectedRoute({
      user: { id: "123", role: "user" },
      loading: false,
    });

    expect(
      screen.getByText("Protected Content")
    ).toBeInTheDocument();
  });

  it("does not show loading or redirect when user exists", () => {
    renderProtectedRoute({
      user: { name: "Kavita" },
      loading: false,
    });

    expect(
      screen.queryByText("Loading...")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Redirected to /login")
    ).not.toBeInTheDocument();
  });
});
