import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../Utils/userContext";
import TableView from "./TableView";
/* =====================================================
   MOCK ROUTER
===================================================== */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/* =====================================================
   MOCK EXPORT HELPERS
===================================================== */

vi.mock("./generateQualityFormExcel", () => ({
  default: vi.fn(),
}));

vi.mock("./DownLoadAllRecords", () => ({
  default: vi.fn(),
}));

import generateQualityFormExcel from "./generateQualityFormExcel";
import DownLoadAllRecords from "./DownLoadAllRecords";

/* =====================================================
   MOCK SHADCN DROPDOWN (IMPORTANT)
===================================================== */

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => (
    <button>{children}</button>
  ),
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

/* =====================================================
   MOCK DATA
===================================================== */

const mockData = [
  {
    createdAt: "2024-01-01T00:00:00Z",
    status: "pending_prod",
    filledBy: "PROD",
    formData: {
      issuingSection: {
        receivingNo: "RCV-001",
        part: { partName: "bolt" },
      },
      defectivenessDetail: {
        supplier: { supplierName: "acme" },
      },
    },
  },
];

/* =====================================================
   HELPER RENDER
===================================================== */

const renderTable = (user) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user }}>
        <TableView data={mockData} />
      </UserContext.Provider>
    </MemoryRouter>
  );
};

/* =====================================================
   TEST SUITE
===================================================== */

describe("TableView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table headers", () => {
    renderTable({ team: { flag: "QA" } });

    expect(screen.getByText("Receiving No.")).toBeInTheDocument();
    expect(screen.getByText("Part Name")).toBeInTheDocument();
    expect(
      screen.getByText("Supplier/Department Name")
    ).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("renders row data correctly", () => {
    renderTable({ team: { flag: "QA" } });

    expect(screen.getByText("RCV-001")).toBeInTheDocument();
    expect(screen.getByText("bolt")).toBeInTheDocument();
    expect(screen.getByText("acme")).toBeInTheDocument();
    expect(
      screen.getByText("AWAITING PRODUCTION REVIEW")
    ).toBeInTheDocument();
  });

  it("renders action button with correct label based on status & team", () => {
    renderTable({ team: { flag: "QA" } });

    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("navigates to Quality Form on action button click", () => {
    renderTable({ team: { flag: "QA" } });

    fireEvent.click(screen.getByText("View"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/Quality-Form",
      expect.objectContaining({
        state: { data: mockData[0] },
      })
    );
  });

  it("exports PDF when Export as PDF is clicked", () => {
    renderTable({ team: { flag: "QA" } });

    fireEvent.click(screen.getByText("Download"));
    fireEvent.click(screen.getByText("Export as PDF"));

    expect(DownLoadAllRecords).toHaveBeenCalledWith([
      mockData[0],
    ]);
  });

  it("exports Excel when Export as Excel is clicked", () => {
    renderTable({ team: { flag: "QA" } });

    fireEvent.click(screen.getByText("Download"));
    fireEvent.click(screen.getByText("Export as Excel"));

    expect(generateQualityFormExcel).toHaveBeenCalledWith(
      mockData[0]
    );
  });

  it("shows no records message when data is empty", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: { team: { flag: "QA" } } }}>
          <TableView data={[]} />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(
      screen.getByText("No records found.")
    ).toBeInTheDocument();
  });

  it("pagination buttons are rendered", () => {
    renderTable({ team: { flag: "QA" } });

    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument();
  });
});
