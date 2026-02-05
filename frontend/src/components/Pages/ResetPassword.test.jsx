import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "./ResetPassword";
import api from "@/api/axiosInstance";
import { toast } from "sonner";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock dependencies
vi.mock("@/api/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockedNavigate,
  useParams: () => ({ token: "mock-token" }),
}));

// Helper to render component
const renderComponent = () =>
  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );

describe("ResetPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error if passwords do not match", async () => {
    renderComponent();

    fireEvent.input(screen.getByLabelText(/new password/i), {
      target: { value: "Valid1@" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "Mismatch1@" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("shows validation error for weak password", async () => {
    renderComponent();

    fireEvent.input(screen.getByLabelText(/new password/i), {
      target: { value: "weak" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "weak" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(
      await screen.findByText(
        /password must contain at least one uppercase letter/i
      )
    ).toBeInTheDocument();
  });

  it("submits form successfully and navigates to login", async () => {
    api.post.mockResolvedValueOnce({ data: { message: "Password reset successful!" } });

    renderComponent();

    fireEvent.input(screen.getByLabelText(/new password/i), {
      target: { value: "Valid1@" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "Valid1@" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Password reset successful!");
      expect(mockedNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("shows API error toast on failure", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Server error" }, status: 500 },
    });

    renderComponent();

    fireEvent.input(screen.getByLabelText(/new password/i), {
      target: { value: "Valid1@" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "Valid1@" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("sets field error when API returns 400", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { errors: { updatedPassword: "Invalid password" } }, status: 400 },
    });

    renderComponent();

    fireEvent.input(screen.getByLabelText(/new password/i), {
      target: { value: "Valid1@" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "Valid1@" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText("Invalid password")).toBeInTheDocument();
  });
});
