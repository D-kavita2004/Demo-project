import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserProvider, UserContext } from "./UserContext";
import api from "@/api/axiosInstance";
import { useContext } from "react";

// Mock api
vi.mock("@/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Test consumer to read context values
const TestConsumer = () => {
  const { user, loading } = useContext(UserContext);

  return (
    <div>
      <span data-testid="loading">
        {loading ? "loading" : "loaded"}
      </span>
      <span data-testid="user">
        {user ? JSON.stringify(user) : "no-user"}
      </span>
    </div>
  );
};

describe("UserProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should verify token and set user when loggedIn is true", async () => {
    localStorage.setItem("loggedIn", "true");

    const mockUser = { id: 1, name: "Kavita" };

    api.get.mockResolvedValueOnce({
      status: 200,
      data: mockUser,
    });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    // Initially loading
    expect(screen.getByTestId("loading").textContent).toBe("loading");

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("loaded")
    );

    expect(api.get).toHaveBeenCalledWith("/verify-token", {
      withCredentials: true,
    });

    expect(screen.getByTestId("user").textContent).toContain("Kavita");
  });

  it("should set user to null if API returns non-200 response", async () => {
    localStorage.setItem("loggedIn", "true");

    api.get.mockResolvedValueOnce({
      status: 401,
    });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("loaded")
    );

    expect(screen.getByTestId("user").textContent).toBe("no-user");
  });

  it("should set user to null if API call fails", async () => {
    localStorage.setItem("loggedIn", "true");

    api.get.mockRejectedValueOnce({
      message: "Token expired",
      response: { data: "Unauthorized" },
    });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("loaded")
    );

    expect(screen.getByTestId("user").textContent).toBe("no-user");
  });

  it("should NOT call verify-token if loggedIn is false", async () => {
    localStorage.setItem("loggedIn", "false");

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("loaded")
    );

    expect(api.get).not.toHaveBeenCalled();
    expect(screen.getByTestId("user").textContent).toBe("no-user");
  });

  it("should stop loading immediately if loggedIn key is missing", async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("loaded")
    );

    expect(api.get).not.toHaveBeenCalled();
  });
});
