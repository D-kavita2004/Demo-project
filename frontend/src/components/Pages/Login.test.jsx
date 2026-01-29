import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";
import { UserContext } from "../Utils/userContext";
import api from "@/api/axiosInstance";

// =====================
// ENV MOCK (CORRECT WAY)
// =====================
vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3000");

// =====================
// MOCK API
// =====================
vi.mock("@/api/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

// =====================
// MOCK ROUTER
// =====================
const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// =====================
// MOCK TOAST
// =====================
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// =====================
// HELPER RENDER
// =====================
const renderLogin = () => {
  const setUser = vi.fn();

  const utils = render(
    <MemoryRouter>
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    </MemoryRouter>
  );

  return {
    ...utils, // gives container, rerender, etc.
    setUser,
  };
};


beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// =====================
// TESTS
// =====================
describe("Login Component", () => {
  it("renders login form", () => {
    renderLogin();

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

//   it("shows validation errors on empty submit", async () => {
//   renderLogin();
//   const user = userEvent.setup();

//   await user.click(screen.getByRole("button", { name: /login/i }));

//   expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
//   expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
//   });

  it("shows backend field errors (400)", async () => {
    renderLogin();
    const user = userEvent.setup();

    api.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          errors: {
            username: "Invalid username",
            password: "Invalid password",
          },
        },
      },
    });

    await user.type(screen.getByLabelText(/username/i), "test");
    await user.type(screen.getByLabelText(/password/i), "test");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Invalid username")).toBeInTheDocument();
    expect(await screen.findByText("Invalid password")).toBeInTheDocument();
  });

  it("disables button while submitting", async () => {
    renderLogin();
    const user = userEvent.setup();

    api.post.mockImplementation(() => new Promise(() => {}));

    await user.type(screen.getByLabelText(/username/i), "test");
    await user.type(screen.getByLabelText(/password/i), "test");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
