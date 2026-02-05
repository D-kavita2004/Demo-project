import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import UsersManagement from "./UsersManagement";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

vi.mock("@/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock EditUserDialog to just render if open
vi.mock("../ReusableComponents/EditDialog", () => ({
  EditUserDialog: ({ open }) => (open ? <div data-testid="edit-dialog">Edit Dialog</div> : null),
}));

// Mock TanstackTable: render buttons for each user to simulate edit & toggle
vi.mock("../ReusableComponents/TanstackTable", () => ({
  default: ({ data, columns }) => (
    <div data-testid="tanstack-table">
      {data.map((u) => (
        <div key={u.username}>
          <button onClick={() => columns[0].cell(u)}>Edit {u.username}</button>
          <button onClick={() => columns[1].cell(u)}>Toggle {u.username}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("./CreateUserForm", () => ({
  default: () => <button>Create User</button>,
}));

describe("UsersManagement Component", () => {
  const mockUsers = [
    { username: "john", enabled: true },
    { username: "alice", enabled: false },
  ];
  const mockSuppliers = [{ supplierCode: "S1", supplierName: "Supplier1" }];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/user/allUsers") return Promise.resolve({ data: { data: mockUsers } });
      if (url === "/suppliers/forUserAssignment") return Promise.resolve({ data: { suppliers: mockSuppliers } });
    });
    api.put.mockResolvedValue({ data: { newStatus: false, message: "Status changed" } });
  });

  it("renders heading and table", async () => {
    render(<UsersManagement />);
    expect(screen.getByText(/users management/i)).toBeInTheDocument();
    expect(await screen.findByTestId("tanstack-table")).toBeInTheDocument();
    expect(screen.getByText("Edit john")).toBeInTheDocument();
    expect(screen.getByText("Edit alice")).toBeInTheDocument();
  });

  it("fetches users and suppliers on mount", async () => {
    render(<UsersManagement />);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/user/allUsers", { withCredentials: true });
      expect(api.get).toHaveBeenCalledWith("/suppliers/forUserAssignment", { withCredentials: true });
    });
  });

  it("handles fetch users API error", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { message: "Fetch error" } } });
    render(<UsersManagement />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Fetch error");
    });
  });

});
