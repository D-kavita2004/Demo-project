import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { UserContext } from "../Utils/userContext";
import { toast } from "sonner";
import { vi } from "vitest";

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/admin/users" };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Outlet: () => <div data-testid="outlet" />,
  };
});

// Mock logout utility
vi.mock("../Utils/logout", () => ({
  logOutUser: vi.fn().mockResolvedValue(true),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminDashboard Component", () => {
  let userValue;

  beforeEach(() => {
    vi.clearAllMocks();
    userValue = { user: { role: "admin" }, setUser: vi.fn() };
  });

  const renderComponent = () =>
    render(
      <UserContext.Provider value={userValue}>
        <AdminDashboard />
      </UserContext.Provider>
    );

  it("renders sidebar, header, and footer", () => {
    renderComponent();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("navigates when sidebar buttons are clicked", () => {
    renderComponent();
    const navButton = screen.getByRole("button", { name: /reports/i });
    fireEvent.click(navButton);
    expect(mockNavigate).toHaveBeenCalledWith("/reports");
  });

  it("logs out user and navigates to login", async () => {
    const { logOutUser } = await import("../Utils/logout");
    renderComponent();
    const logoutBtn = screen.getByText(/logout/i);

    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(logOutUser).toHaveBeenCalled();
    expect(userValue.setUser).toHaveBeenCalledWith(null);
    expect(toast.success).toHaveBeenCalledWith("Logged out");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("redirects non-admin users", async () => {
    userValue.user.role = "user";
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("You are not allowed to access Admin Dashboard");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
