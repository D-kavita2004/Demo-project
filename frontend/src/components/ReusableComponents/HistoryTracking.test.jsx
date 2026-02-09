import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HistoryTracking from "./HistoryTracking";

/* =====================================================
   MOCK SHADCN ACCORDION (IMPORTANT)
===================================================== */

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }) => <div>{children}</div>,
  AccordionItem: ({ children }) => <div>{children}</div>,
  AccordionTrigger: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
  AccordionContent: ({ children }) => <div>{children}</div>,
}));

/* =====================================================
   MOCK DATA
===================================================== */

const mockHistoryTracks = [
  {
    cycle: 1,
    data: {
      measuresReport: {
        prodFile: "https://example.com/file1.pdf",
        causesOfOccurrence: "Cause 1",
        causesOfOutflow: "Outflow 1",
        counterMeasuresForCauses: "Counter Cause 1",
        counterMeasuresForOutflow: "Counter Outflow 1",
        enforcementDate: "2024-01-01",
        standardization: "Standard 1",
      },
      resultsOfMeasuresEnforcement: {
        enforcementDateResult: "2024-02-01",
        enforcementResult: "Result 1",
        enforcementJudgment: "OK",
        enforcementSecInCharge: "Section A",
        enforcementQCSection: "QC A",
      },
    },
  },
  {
    cycle: 2,
    data: {
      measuresReport: {
        prodFile: null,
        causesOfOccurrence: "Cause 2",
        causesOfOutflow: "Outflow 2",
        counterMeasuresForCauses: "Counter Cause 2",
        counterMeasuresForOutflow: "Counter Outflow 2",
        enforcementDate: "2024-03-01",
        standardization: "Standard 2",
      },
      resultsOfMeasuresEnforcement: {
        enforcementDateResult: "2024-04-01",
        enforcementResult: "Result 2",
        enforcementJudgment: "NG",
        enforcementSecInCharge: "Section B",
        enforcementQCSection: "QC B",
      },
    },
  },
];

/* =====================================================
   TEST SUITE
===================================================== */

describe("HistoryTracking Component", () => {
  it("renders History title", () => {
    render(<HistoryTracking historyTracks={[]} />);

    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("renders accordion items for each history track", () => {
    render(<HistoryTracking historyTracks={mockHistoryTracks} />);

    // reverse() means cycle 2 appears first
    expect(screen.getByText("Revision : 2")).toBeInTheDocument();
    expect(screen.getByText("Revision : 1")).toBeInTheDocument();
  });

  it("renders Measures Report and Results sections", () => {
    render(<HistoryTracking historyTracks={mockHistoryTracks} />);

    expect(
      screen.getAllByText("Measures Report")[0]
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Results of Measures Enforcement")[0]
    ).toBeInTheDocument();
  });

  it("renders file link when fileUrl is present", () => {
    render(<HistoryTracking historyTracks={mockHistoryTracks} />);

    const fileLink = screen.getByText("📄 View file");
    expect(fileLink).toBeInTheDocument();
    expect(fileLink).toHaveAttribute(
      "href",
      "https://example.com/file1.pdf"
    );
  });

  it("renders placeholder when fileUrl is missing", () => {
    render(<HistoryTracking historyTracks={mockHistoryTracks} />);

    // second item has no file → placeholder dash
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders field values correctly", () => {
    render(<HistoryTracking historyTracks={mockHistoryTracks} />);

    expect(screen.getByText("Cause 1")).toBeInTheDocument();
    expect(screen.getByText("Outflow 2")).toBeInTheDocument();
    expect(screen.getByText("Standard 2")).toBeInTheDocument();
    expect(screen.getByText("QC B")).toBeInTheDocument();
  });

  it("accordion trigger is clickable", () => {
    render(<HistoryTracking historyTracks={mockHistoryTracks} />);

    const trigger = screen.getByText("Revision : 2");
    fireEvent.click(trigger);

    expect(trigger).toBeInTheDocument();
  });
});
