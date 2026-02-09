import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { logOutUser } from "./logout";

// Mock axios
vi.mock("axios");

describe("logOutUser", () => {
  const BASE_URL = "http://localhost:5000";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock env variable
    import.meta.env.VITE_API_BASE_URL = BASE_URL;

    // Mock localStorage
    vi.spyOn(Storage.prototype, "setItem");
  });

  it("should call logout API with correct URL and credentials", async () => {
    axios.get.mockResolvedValueOnce({});

    await logOutUser();

    expect(axios.get).toHaveBeenCalledWith(
      `${BASE_URL}/auth/logout`,
      { withCredentials: true }
    );
  });

  it("should set loggedIn to false in localStorage on success", async () => {
    axios.get.mockResolvedValueOnce({});

    await logOutUser();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "loggedIn",
      false
    );
  });

  it("should handle API failure gracefully", async () => {
    const error = new Error("Network Error");
    axios.get.mockRejectedValueOnce(error);

    const consoleSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await logOutUser();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Logout API failed:",
      error
    );

    consoleSpy.mockRestore();
  });

  it("should NOT set localStorage if API fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Down"));

    await logOutUser();

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
