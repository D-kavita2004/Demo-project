import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Reports from "./Reports";

/* -------------------- MOCK CHART COMPONENTS -------------------- */
vi.mock("../ReusableComponents/Charts/DepartmentPieChart", () => ({
  default: () => <div data-testid="department-pie-chart" />,
}));

vi.mock("../ReusableComponents/Charts/FormsBarChart", () => ({
  default: () => <div data-testid="forms-bar-chart" />,
}));

vi.mock("../ReusableComponents/Charts/StatusWiseChart", () => ({
  default: () => <div data-testid="status-wise-chart" />,
}));

/* -------------------- TESTS -------------------- */
describe("Reports Component", () => {
  it("renders the main heading and subheading", () => {
    render(<Reports />);
    expect(screen.getByText(/reports & analytics dashboard/i)).toBeInTheDocument();
    expect(
      screen.getByText(/visual insights to track performance and activities/i)
    ).toBeInTheDocument();
  });

  it("renders StatusWiseChart", () => {
    render(<Reports />);
    expect(screen.getByTestId("status-wise-chart")).toBeInTheDocument();
  });

  it("renders DepartmentPieChart", () => {
    render(<Reports />);
    expect(screen.getByTestId("department-pie-chart")).toBeInTheDocument();
  });

  it("renders FormsBarChart", () => {
    render(<Reports />);
    expect(screen.getByTestId("forms-bar-chart")).toBeInTheDocument();
  });

  it("renders all chart headings", () => {
    render(<Reports />);
    expect(screen.getByText(/workflow status overview/i)).toBeInTheDocument();
    expect(
      screen.getByText(/issues assigned to departments created between the selected dates/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/status of forms created between selected dates/i)
    ).toBeInTheDocument();
  });
});
