import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Processes from "./ProcessNames";
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

// Mock TanstackTable to directly call deleteProcess
vi.mock("../ReusableComponents/TanstackTable", () => ({
  default: ({ data, columns }) => (
    <div>
      {data.map((p) => (
        <div key={p?.processCode}>
          <span>{p?.processName}</span>
          <button
            onClick={() => {
              const deleteFn = columns[0].deleteProcess;
              if (deleteFn) deleteFn(p.processCode);
            }}
          >
            delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock ProcessDialog
vi.mock("../ReusableComponents/EditDialog", () => ({
  ProcessDialog: ({ open, action, mode }) =>
    open ? (
      <div>
        <p>{mode} dialog</p>
        <button onClick={() => action("Test Process")}>submit</button>
      </div>
    ) : null,
}));

// Mock Columns to pass deleteProcess for the test
vi.mock("../Utils/Columns", () => ({
  processesColumns: (handleEdit, deleteProcess) => [
    {
      header: "Actions",
      deleteProcess,
      cell: ({ row }) => (
        <button onClick={() => deleteProcess(row.original.processCode)}>
          delete
        </button>
      ),
    },
  ],
}));

/* -------------------- TEST DATA -------------------- */
const mockProcesses = [
  { processCode: "PR001", processName: "Assembly" },
  { processCode: "PR002", processName: "Packaging" },
];

/* -------------------- TESTS -------------------- */
describe("Processes Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------- RENDER -------------------- */
  it("renders Processes Management heading", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: [] } });
    await act(async () => {
      render(<Processes />);
    });
    expect(screen.getByText(/processes management/i)).toBeInTheDocument();
  });

  /* -------------------- FETCH -------------------- */
  it("fetches and displays processes on mount", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: mockProcesses } });

    await act(async () => {
      render(<Processes />);
    });

    expect(await screen.findByText("Assembly")).toBeInTheDocument();
    expect(screen.getByText("Packaging")).toBeInTheDocument();
  });

  it("shows error toast when fetching processes fails", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: "Fetch failed" } } });

    await act(async () => {
      render(<Processes />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fetch failed");
    });
  });

  /* -------------------- CREATE -------------------- */
  it("opens create dialog when clicking Create New Process", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: [] } });

    await act(async () => {
      render(<Processes />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new process/i }));
    expect(await screen.findByText(/create dialog/i)).toBeInTheDocument();
  });

  it("creates process successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: [] } });
    api.post.mockResolvedValueOnce({
      data: {
        process: { processCode: "PR003", processName: "Testing" },
        message: "Process created successfully!",
      },
    });

    await act(async () => {
      render(<Processes />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new process/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Process created successfully!");
    });

    expect(await screen.findByText("Testing")).toBeInTheDocument();
  });

  it("shows error toast when create fails", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: [] } });
    api.post.mockRejectedValueOnce({
      response: { data: { errors: { processName: "Process name required" } } },
    });

    await act(async () => {
      render(<Processes />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new process/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Process name required");
    });
  });

  /* -------------------- UPDATE -------------------- */
  it("updates process successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: mockProcesses } });
    api.put.mockResolvedValueOnce({
      data: { process: { processCode: "PR001", processName: "Updated Assembly" } },
    });

    await act(async () => {
      render(<Processes />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new process/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  /* -------------------- DELETE -------------------- */
  it("deletes process successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { processes: mockProcesses } });
    api.delete.mockResolvedValueOnce({ data: { message: "Process Deleted successfully!" } });

    await act(async () => {
      render(<Processes />);
    });

    // Wait for the first process to appear
    expect(await screen.findByText("Assembly")).toBeInTheDocument();

    // Click the delete button for the first process
    fireEvent.click(screen.getAllByText("delete")[0]);

    // Wait for toast to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Process Deleted successfully!");
    });

    // Confirm the deleted process is removed
    await waitFor(() => {
      expect(screen.queryByText("Assembly")).not.toBeInTheDocument();
    });

    // Confirm other process still exists
    expect(screen.getByText("Packaging")).toBeInTheDocument();
  });
});
