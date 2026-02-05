import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Machines from "./MachineNames";
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

// Mock TanstackTable to directly call deleteMachine
vi.mock("../ReusableComponents/TanstackTable", () => ({
  default: ({ data, columns }) => (
    <div>
      {data.map((m) => (
        <div key={m?.machineCode}>
          <span>{m?.machineName}</span>
          <button
            onClick={() => {
              const deleteFn = columns[0].deleteMachine;
              if (deleteFn) deleteFn(m.machineCode);
            }}
          >
            delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock MachineDialog
vi.mock("../ReusableComponents/EditDialog", () => ({
  MachineDialog: ({ open, action, mode }) =>
    open ? (
      <div>
        <p>{mode} dialog</p>
        <button onClick={() => action("Test Machine")}>submit</button>
      </div>
    ) : null,
}));

// Mock Columns to pass deleteMachine for the test
vi.mock("../Utils/Columns", () => ({
  machinesColumns: (handleEdit, deleteMachine) => [
    {
      header: "Actions",
      deleteMachine,
      cell: ({ row }) => (
        <button onClick={() => deleteMachine(row.original.machineCode)}>delete</button>
      ),
    },
  ],
}));

/* -------------------- TEST DATA -------------------- */
const mockMachines = [
  { machineCode: "MC001", machineName: "Lathe" },
  { machineCode: "MC002", machineName: "Drill" },
];

/* -------------------- TESTS -------------------- */
describe("Machines Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------- RENDER -------------------- */
  it("renders Machines Management heading", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: [] } });
    await act(async () => {
      render(<Machines />);
    });
    expect(screen.getByText(/machines management/i)).toBeInTheDocument();
  });

  /* -------------------- FETCH -------------------- */
  it("fetches and displays machines on mount", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: mockMachines } });

    await act(async () => {
      render(<Machines />);
    });

    expect(await screen.findByText("Lathe")).toBeInTheDocument();
    expect(screen.getByText("Drill")).toBeInTheDocument();
  });

  it("shows error toast when fetching machines fails", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: "Fetch failed" } } });

    await act(async () => {
      render(<Machines />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fetch failed");
    });
  });

  /* -------------------- CREATE -------------------- */
  it("opens create dialog when clicking Create New Machine", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: [] } });

    await act(async () => {
      render(<Machines />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new machine/i }));
    expect(await screen.findByText(/create dialog/i)).toBeInTheDocument();
  });

  it("creates machine successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: [] } });
    api.post.mockResolvedValueOnce({
      data: {
        machine: { machineCode: "MC003", machineName: "Grinder" },
        message: "Machine created successfully!",
      },
    });

    await act(async () => {
      render(<Machines />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new machine/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Machine created successfully!");
    });

    expect(await screen.findByText("Grinder")).toBeInTheDocument();
  });

  it("shows error toast when create fails", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: [] } });
    api.post.mockRejectedValueOnce({
      response: { data: { errors: { machineName: "Machine name required" } } },
    });

    await act(async () => {
      render(<Machines />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new machine/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Machine name required");
    });
  });

  /* -------------------- UPDATE -------------------- */
  it("updates machine successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: mockMachines } });
    api.put.mockResolvedValueOnce({
      data: { machine: { machineCode: "MC001", machineName: "Updated Lathe" } },
    });

    await act(async () => {
      render(<Machines />);
    });

    fireEvent.click(screen.getByRole("button", { name: /create new machine/i }));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  /* -------------------- DELETE -------------------- */
  it("deletes machine successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { machines: mockMachines } });
    api.delete.mockResolvedValueOnce({ data: { message: "Machine Deleted successfully!" } });

    await act(async () => {
      render(<Machines />);
    });

    // Wait for the first machine to appear
    expect(await screen.findByText("Lathe")).toBeInTheDocument();

    // Click the delete button for the first machine
    fireEvent.click(screen.getAllByText("delete")[0]);

    // Wait for toast to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Machine Deleted successfully!");
    });

    // Confirm the deleted machine is removed
    await waitFor(() => {
      expect(screen.queryByText("Lathe")).not.toBeInTheDocument();
    });

    // Confirm other machine still exists
    expect(screen.getByText("Drill")).toBeInTheDocument();
  });
});
