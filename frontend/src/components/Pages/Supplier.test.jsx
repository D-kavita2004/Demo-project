import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Suppliers from "./Suppliers";
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

// Mock TanstackTable to directly call deleteSupplier
vi.mock("../ReusableComponents/TanstackTable", () => ({
  default: ({ data, columns }) => (
    <div>
      {data.map((s) => (
        <div key={s?.supplierCode}>
          <span>{s?.supplierName}</span>
          <button
            onClick={() => {
              const deleteFn = columns[0].deleteSupplier;
              if (deleteFn) deleteFn(s.supplierCode);
            }}
          >
            delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock SupplierDialog
vi.mock("../ReusableComponents/EditDialog", () => ({
  SupplierDialog: ({ open, action, mode }) =>
    open ? (
      <div>
        <p>{mode} dialog</p>
        <button onClick={() => action("Test Supplier")}>submit</button>
      </div>
    ) : null,
}));

// Mock Columns to pass deleteSupplier for the test
vi.mock("../Utils/Columns", () => ({
  suppliersColumns: (handleEdit, deleteSupplier) => [
    {
      header: "Actions",
      deleteSupplier,
      cell: ({ row }) => (
        <button onClick={() => deleteSupplier(row.original.supplierCode)}>delete</button>
      ),
    },
  ],
}));

/* -------------------- TEST DATA -------------------- */
const mockSuppliers = [
  { supplierCode: "SP001", supplierName: "ABC Supplies" },
  { supplierCode: "SP002", supplierName: "XYZ Industries" },
];

/* -------------------- TESTS -------------------- */
describe("Suppliers Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------- RENDER -------------------- */
  it("renders Suppliers Management heading", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: [] } });
    await act(async () => {
      render(<Suppliers />);
    });
    expect(screen.getByText(/suppliers\/sections management/i)).toBeInTheDocument();
  });

  /* -------------------- FETCH -------------------- */
  it("fetches and displays suppliers on mount", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: mockSuppliers } });

    await act(async () => {
      render(<Suppliers />);
    });

    expect(await screen.findByText("ABC Supplies")).toBeInTheDocument();
    expect(screen.getByText("XYZ Industries")).toBeInTheDocument();
  });

  it("shows error toast when fetching suppliers fails", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: "Fetch failed" } } });

    await act(async () => {
      render(<Suppliers />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fetch failed");
    });
  });

  /* -------------------- CREATE -------------------- */
  it("opens create dialog when clicking Create New Supplier", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: [] } });

    await act(async () => {
      render(<Suppliers />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new supplier/i }));
    expect(await screen.findByText(/create dialog/i)).toBeInTheDocument();
  });

  it("creates supplier successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: [] } });
    api.post.mockResolvedValueOnce({
      data: {
        supplier: { supplierCode: "SP003", supplierName: "New Supplier" },
        message: "Supplier created successfully!",
      },
    });

    await act(async () => {
      render(<Suppliers />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new supplier/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Supplier created successfully!");
    });

    expect(await screen.findByText("New Supplier")).toBeInTheDocument();
  });

  it("shows error toast when create fails", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: [] } });
    api.post.mockRejectedValueOnce({
      response: { data: { errors: { supplierName: "Supplier name required" } } },
    });

    await act(async () => {
      render(<Suppliers />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new supplier/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Supplier name required");
    });
  });

  /* -------------------- UPDATE -------------------- */
  it("updates supplier successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: mockSuppliers } });
    api.put.mockResolvedValueOnce({
      data: { supplier: { supplierCode: "SP001", supplierName: "Updated Supplier" } },
    });

    await act(async () => {
      render(<Suppliers />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new supplier/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  /* -------------------- DELETE -------------------- */
  it("deletes supplier successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { suppliers: mockSuppliers } });
    api.delete.mockResolvedValueOnce({ data: { message: "Supplier Deleted successfully!" } });

    await act(async () => {
      render(<Suppliers />);
    });

    // Wait for the first supplier to appear
    expect(await screen.findByText("ABC Supplies")).toBeInTheDocument();

    // Click the delete button for the first supplier
    fireEvent.click(screen.getAllByText("delete")[0]);

    // Wait for toast to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Supplier Deleted successfully!");
    });

    // Confirm the deleted supplier is removed
    await waitFor(() => {
      expect(screen.queryByText("ABC Supplies")).not.toBeInTheDocument();
    });

    // Confirm other supplier still exists
    expect(screen.getByText("XYZ Industries")).toBeInTheDocument();
  });
});
