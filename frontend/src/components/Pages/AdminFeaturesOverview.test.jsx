import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminFeaturesOverview from "./AdminFeaturesOverview";

// -------------------- MOCKS -------------------- //

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock DefaultData cards
vi.mock("../Utils/DefaultData", () => ({
  cards: [
    { id: 1, title: "Processes", route: "/processes", color: "from-blue-500 to-blue-700", icon: <span>Icon1</span> },
    { id: 2, title: "Machines", route: "/machines", color: "from-green-500 to-green-700", icon: <span>Icon2</span> },
    { id: 3, title: "Suppliers", route: "/suppliers", color: "from-red-500 to-red-700", icon: <span>Icon3</span> },
  ],
}));

describe("AdminFeaturesOverview Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all cards with correct titles", () => {
    render(<AdminFeaturesOverview />);

    expect(screen.getByText("Processes")).toBeInTheDocument();
    expect(screen.getByText("Machines")).toBeInTheDocument();
    expect(screen.getByText("Suppliers")).toBeInTheDocument();
  });

  it("renders description text for each card", () => {
    render(<AdminFeaturesOverview />);
    
    expect(screen.getByText(/click to manage processes efficiently/i)).toBeInTheDocument();
    expect(screen.getByText(/click to manage machines efficiently/i)).toBeInTheDocument();
    expect(screen.getByText(/click to manage suppliers efficiently/i)).toBeInTheDocument();
  });

  it("navigates to correct route when a card is clicked", () => {
    render(<AdminFeaturesOverview />);

    // Click each card and check navigate
    fireEvent.click(screen.getByText("Processes"));
    expect(mockNavigate).toHaveBeenCalledWith("/processes");

    fireEvent.click(screen.getByText("Machines"));
    expect(mockNavigate).toHaveBeenCalledWith("/machines");

    fireEvent.click(screen.getByText("Suppliers"));
    expect(mockNavigate).toHaveBeenCalledWith("/suppliers");
  });
});
