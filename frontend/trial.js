import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Parts from "./PartNames";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

/* -------------------- MOCKS -------------------- */

vi.mock("@/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock TanstackTable so that delete button calls the real deletePart function
vi.mock("../ReusableComponents/TanstackTable", () => ({
  default: ({ data, deletePart }) => (
    <div>
      {data.map((p) => (
        <div key={p.partCode}>
          <span>{p.partName}</span>
          <button onClick={() => deletePart && deletePart(p.partCode)}>
            delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock PartDialog
vi.mock("../ReusableComponents/EditDialog", () => ({
  PartDialog: ({ open, action, mode }) =>
    open ? (
      <div>
        <p>{mode} dialog</p>
        <button onClick={() => action("Test Part")}>submit</button>
      </div>
    ) : null,
}));

/* -------------------- TEST DATA -------------------- */

const mockParts = [
  { partCode: "P001", partName: "Bolt" },
  { partCode: "P002", partName: "Nut" },
];

/* -------------------- TESTS -------------------- */

describe("Parts Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------- RENDER -------------------- */

  it("renders Parts Management heading", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });

    render(<Parts />);

    expect(
      screen.getByText(/parts management/i)
    ).toBeInTheDocument();
  });

  /* -------------------- FETCH -------------------- */

  it("fetches and displays parts on mount", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: mockParts } });

    render(<Parts />);

    expect(await screen.findByText("Bolt")).toBeInTheDocument();
    expect(screen.getByText("Nut")).toBeInTheDocument();
  });

  it("shows error toast when fetching parts fails", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { message: "Fetch failed" } },
    });

    render(<Parts />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fetch failed");
    });
  });

  /* -------------------- CREATE -------------------- */

  it("opens create dialog when clicking Create New Part", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });

    render(<Parts />);

    fireEvent.click(
      screen.getByRole("button", { name: /create new part/i })
    );

    expect(await screen.findByText(/create dialog/i)).toBeInTheDocument();
  });

  it("creates part successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });
    api.post.mockResolvedValueOnce({
      data: {
        part: { partCode: "P003", partName: "Screw" },
        message: "Part created successfully!",
      },
    });

    render(<Parts />);

    fireEvent.click(
      screen.getByRole("button", { name: /create new part/i })
    );

    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Part created successfully!"
      );
    });

    expect(await screen.findByText("Screw")).toBeInTheDocument();
  });

  it("shows error toast when create fails", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });
    api.post.mockRejectedValueOnce({
      response: {
        data: { errors: { partName: "Part name required" } },
      },
    });

    render(<Parts />);

    fireEvent.click(
      screen.getByRole("button", { name: /create new part/i })
    );

    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Part name required");
    });
  });

  /* -------------------- UPDATE -------------------- */

  it("updates part successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: mockParts } });
    api.put.mockResolvedValueOnce({
      data: {
        part: { partCode: "P001", partName: "Updated Bolt" },
      },
    });

    render(<Parts />);

    fireEvent.click(
      screen.getByRole("button", { name: /create new part/i })
    );

    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  /* -------------------- DELETE -------------------- */

});
