// sectionPermissionWrapper.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock the schemas **before importing the component**
vi.mock("../ValidateSchema/formDataValidationSchema", () => ({
  NewFormSchema: { type: "new" },
  ProdResponseSchema: { type: "prod" },
  QAResponseSchema: { type: "qa" },
  FinalResponseSchema: { type: "final" },
  EmptySchema: { type: "empty" },
}));

import { PermissionedSection, getSectionAccess, GetRelatedSchema } from "./sectionPermissionWrapper";
import { UserContext } from "./userContext";

describe("PermissionedSection Component", () => {
  const renderWithUser = (flag, children, isNewForm = false, formStatus = "pending_prod") => {
    const user = { team: { flag } };
    return render(
      <UserContext.Provider value={{ user }}>
        <PermissionedSection sectionKey="issuingSection" isNewForm={isNewForm} formStatus={formStatus}>
          {children}
        </PermissionedSection>
      </UserContext.Provider>
    );
  };

  it("renders children when access is 'edit' for new QA form", () => {
    renderWithUser("QA", (access) => <span>Access: {access}</span>, true);

    expect(screen.getByText("Access: edit")).toBeInTheDocument();
  });

  it("does not render children when access is 'hidden'", () => {
    renderWithUser("INTERNAL", (access) => <span>Access: {access}</span>, true);

    expect(screen.queryByText(/Access/)).not.toBeInTheDocument();
  });
});

describe("GetRelatedSchema function", () => {
  it("returns NewFormSchema for new form", () => {
    expect(GetRelatedSchema("any", true)).toEqual({ type: "new" });
  });

  it("returns ProdResponseSchema for pending_prod", () => {
    expect(GetRelatedSchema("pending_prod", false)).toEqual({ type: "prod" });
  });
});
