import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Parts from "./PartNames";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

/* -------------------- MOCKS -------------------- */

// Mock Axios API
vi.mock("@/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock TanstackTable to directly call deletePart
vi.mock("../ReusableComponents/TanstackTable", () => ({
  default: ({ data, columns }) => (
    <div>
      {data.map((p) => (
        <div key={p?.partCode}>
          <span>{p?.partName}</span>
          <button
            onClick={() => {
              const deleteFn = columns[0].deletePart;
              if (deleteFn) deleteFn(p.partCode);
            }}
          >
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

// Mock partsColumns to pass deletePart for the test
vi.mock("../Utils/Columns", () => ({
  partsColumns: (handleEdit, deletePart) => [
    {
      header: "Actions",
      deletePart,
      cell: ({ row }) => (
        <button onClick={() => deletePart(row.original.partCode)}>delete</button>
      ),
    },
  ],
}));

/* -------------------- TEST DATA -------------------- */
const mockParts = [
  { partCode: "PT001", partName: "Gear" },
  { partCode: "PT002", partName: "Bolt" },
];

/* -------------------- TESTS -------------------- */
describe("Parts Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------- RENDER -------------------- */
  it("renders Parts Management heading", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });
    await act(async () => {
      render(<Parts />);
    });
    expect(screen.getByText(/parts management/i)).toBeInTheDocument();
  });

  /* -------------------- FETCH -------------------- */
  it("fetches and displays parts on mount", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: mockParts } });

    await act(async () => {
      render(<Parts />);
    });

    expect(await screen.findByText("Gear")).toBeInTheDocument();
    expect(screen.getByText("Bolt")).toBeInTheDocument();
  });

  it("shows error toast when fetching parts fails", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: "Fetch failed" } } });

    await act(async () => {
      render(<Parts />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fetch failed");
    });
  });

  /* -------------------- CREATE -------------------- */
  it("opens create dialog when clicking Create New Part", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });

    await act(async () => {
      render(<Parts />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new part/i }));
    expect(await screen.findByText(/create dialog/i)).toBeInTheDocument();
  });

  it("creates part successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });
    api.post.mockResolvedValueOnce({
      data: {
        part: { partCode: "PT003", partName: "New Part" },
        message: "Part created successfully!",
      },
    });

    await act(async () => {
      render(<Parts />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new part/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Part created successfully!");
    });

    expect(await screen.findByText("New Part")).toBeInTheDocument();
  });

  it("shows error toast when create fails", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: [] } });
    api.post.mockRejectedValueOnce({
      response: { data: { errors: { partName: "Part name required" } } },
    });

    await act(async () => {
      render(<Parts />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new part/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Part name required");
    });
  });

  /* -------------------- UPDATE -------------------- */
  it("updates part successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: mockParts } });
    api.put.mockResolvedValueOnce({
      data: { part: { partCode: "PT001", partName: "Updated Gear" } },
    });

    await act(async () => {
      render(<Parts />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new part/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  /* -------------------- DELETE -------------------- */
  it("deletes part successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { parts: mockParts } });
    api.delete.mockResolvedValueOnce({ data: { message: "Part Deleted successfully!" } });

    await act(async () => {
      render(<Parts />);
    });

    // Wait for the first part to appear
    expect(await screen.findByText("Gear")).toBeInTheDocument();

    // Click the delete button for the first part
    fireEvent.click(screen.getAllByText("delete")[0]);

    // Wait for toast to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Part Deleted successfully!");
    });

    // Confirm the deleted part is removed
    await waitFor(() => {
      expect(screen.queryByText("Gear")).not.toBeInTheDocument();
    });

    // Confirm other part still exists
    expect(screen.getByText("Bolt")).toBeInTheDocument();
  });
});
