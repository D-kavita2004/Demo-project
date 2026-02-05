import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPassword from "./ForgotPassword";
import api from "@/api/axiosInstance";

/* ===========================
   MOCKS
=========================== */

// Mock axios
vi.mock("@/api/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock toast
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args) => toastSuccessMock(...args),
    error: (...args) => toastErrorMock(...args),
  },
}));

/* ===========================
   TESTS
=========================== */

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password form", () => {
    render(<ForgotPassword />);

    expect(
      screen.getByText(/forgot password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("disables submit button while submitting", async () => {
    api.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { message: "Email sent" } }), 100)
        )
    );

    render(<ForgotPassword />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/sending/i);
  });

  it("calls API and shows success toast on successful submit", async () => {
    api.post.mockResolvedValueOnce({
      data: { message: "Reset link sent" },
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@example.com",
      });
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Reset link sent");
  });

  it("shows generic error toast for server error", async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 500,
        statusText: "Internal Server Error",
      },
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole("button", {
      name: /send reset link/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });
  });
});
