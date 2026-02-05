import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "./Dashboard";
import { UserContext } from "../Utils/userContext";
import api from "@/api/axiosInstance";

/* ===========================
   MOCKS
=========================== */

// Mock axios instance
vi.mock("@/api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock TableView (we don't test its internals)
vi.mock("../ReusableComponents/TableView", () => ({
  default: ({ data }) => (
    <div data-testid="table-view">Rows: {data.length}</div>
  ),
}));

// Mock DownloadAllRecords
const downloadMock = vi.fn();
vi.mock("../ReusableComponents/DownLoadAllRecords", () => ({
  default: (...args) => downloadMock(...args),
}));

/* ===========================
   HELPERS
=========================== */

const renderDashboard = (user = { username: "Kavita", team: "QA" }) => {
  return render(
    <UserContext.Provider value={{ user }}>
      <Dashboard />
    </UserContext.Provider>
  );
};

const mockForms = [
  {
    status: "pending_prod",
    formData: {
      issuingSection: {
        receivingNo: "DIN-25-001",
        part: { partName: "Bolt" },
      },
      defectivenessDetail: {
        supplier: { supplierName: "ABC Corp" },
      },
    },
  },
  {
    status: "pending_prod",
    formData: {
      issuingSection: {
        receivingNo: "DIN-25-002",
        part: { partName: "Nut" },
      },
      defectivenessDetail: {
        supplier: { supplierName: "XYZ Ltd" },
      },
    },
  },
];

/* ===========================
   TESTS
=========================== */

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome message with username", async () => {
    api.get.mockResolvedValueOnce({ data: { forms: [] } });

    renderDashboard();

    expect(
      await screen.findByText(/welcome kavita/i)
    ).toBeInTheDocument();
  });

  it("fetches forms on mount and renders table", async () => {
    api.get.mockResolvedValueOnce({
      data: { forms: mockForms },
    });

    renderDashboard();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    expect(screen.getByTestId("table-view")).toHaveTextContent("Rows: 2");
  });

  it("filters table data based on search input", async () => {
    api.get.mockResolvedValueOnce({
      data: { forms: mockForms },
    });

    renderDashboard();

    const searchInput = await screen.findByPlaceholderText(
      /search by receiving no/i
    );

    await userEvent.type(searchInput, "DIN-25-001");

    expect(screen.getByTestId("table-view")).toHaveTextContent("Rows: 1");
  });

  it("shows Download All Records button only when data exists", async () => {
    api.get.mockResolvedValueOnce({
      data: { forms: mockForms },
    });

    renderDashboard();

    expect(
      await screen.findByRole("button", {
        name: /download all records/i,
      })
    ).toBeInTheDocument();
  });

  it("calls DownloadAllRecords when button is clicked", async () => {
    api.get.mockResolvedValueOnce({
      data: { forms: mockForms },
    });

    renderDashboard();

    const button = await screen.findByRole("button", {
      name: /download all records/i,
    });

    await userEvent.click(button);

    expect(downloadMock).toHaveBeenCalledWith(mockForms);
  });
});
