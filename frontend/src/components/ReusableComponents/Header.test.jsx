import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Header from "./Header";
import { UserContext } from "../Utils/userContext";
import { toast } from "sonner";
import * as logoutApi from "../Utils/logout";

/* =====================================================
   MOCKS
===================================================== */

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/* =====================================================
   HELPER RENDER FUNCTION
===================================================== */

const renderHeader = (user = null) => {
  const setUser = vi.fn();

  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser }}>
        <Header />
      </UserContext.Provider>
    </MemoryRouter>
  );

  return { setUser };
};

/* =====================================================
   TEST SUITE
===================================================== */

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo, dashboard title and logout button", () => {
    renderHeader();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByAltText("App Logo")).toBeInTheDocument();
  });

  it("shows Admin Panel button for admin user", () => {
    renderHeader({ role: "admin" });

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("does not show Admin Panel for non-admin user", () => {
    renderHeader({ role: "user" });

    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
  });

  it("shows QC button for QA team user", () => {
    renderHeader({ team: { flag: "QA" } });

    expect(screen.getByText("QC")).toBeInTheDocument();
  });

  it("does not show QC button for non-QA user", () => {
    renderHeader({ team: { flag: "DEV" } });

    expect(screen.queryByText("QC")).not.toBeInTheDocument();
  });

  it("navigates to Reports page when Reports button is clicked", () => {
    renderHeader();

    fireEvent.click(screen.getByText("Reports"));

    expect(mockNavigate).toHaveBeenCalledWith("/reports");
  });

  it("navigates to Admin Panel page when Admin Panel is clicked", () => {
    renderHeader({ role: "admin" });

    fireEvent.click(screen.getByText("Admin Panel"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("navigates to dashboard when logo/title is clicked", () => {
    renderHeader();

    fireEvent.click(screen.getByText("Dashboard"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("logs out user, clears context, shows toast and navigates to login", async () => {
    const logoutSpy = vi
      .spyOn(logoutApi, "logOutUser")
      .mockResolvedValueOnce();

    const { setUser } = renderHeader({ role: "admin" });

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(setUser).toHaveBeenCalledWith(null);
      expect(toast.success).toHaveBeenCalledWith("Logged out");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
