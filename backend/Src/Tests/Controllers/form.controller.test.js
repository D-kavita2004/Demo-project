import { jest } from "@jest/globals";

// =========================
// MOCK MODULES
// =========================
jest.unstable_mockModule("../../Models/form.models.js", () => {
  const FormMock = jest.fn();

  FormMock.findById = jest.fn();
  FormMock.findByIdAndUpdate = jest.fn();
  FormMock.find = jest.fn();

  return {
    default: FormMock,
  };
});

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const Form = (await import("../../Models/form.models.js")).default;
const logger = (await import("../../../Config/logger.js")).default;

const {
  createNewIssue,
  handleProdResponse,
  handleApprove,
  handleReject,
  handleFinalSubmit,
  getAllForms,
} = await import("../../Controllers/form.controller.js");

// =========================
// HELPER: MOCK RESPONSE
// =========================
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
// =========================
// TEST: createNewIssue
// =========================

describe("createNewIssue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if user is not QA", async () => {
    const req = {
      user: { team: { flag: "INTERNAL" } },
      body: { data: { issuingSection: {}, defectivenessDetail: {}, qualityCheckComment: "ok" } },
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Quality team can submit new forms",
    });
  });

  it("should return 404 if form data is missing", async () => {
    const req = { user: { team: { flag: "QA" } }, body: {} };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form data is required",
    });
  });

  it("should create a new issue successfully if QA provides data", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    Form.mockImplementation(() => ({
      save: mockSave,
    }));

    const req = {
      user: { team: { flag: "QA" } },
      body: {
        data: {
          issuingSection: {},
          defectivenessDetail: {},
          qualityCheckComment: "ok",
        },
      },
      productImageUrl: "image.jpg",
    };

    const res = mockRes();

    await createNewIssue(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Issue submitted successfully",
        form: expect.any(Object),
      }),
    );
  });


  it("should handle server errors and return 500", async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error("DB error"));

    Form.mockImplementation(() => ({
      save: mockSave,
    }));

    const req = {
      user: { team: { flag: "QA" } },
      body: {
        data: {
          issuingSection: {},
          defectivenessDetail: {},
          qualityCheckComment: "ok",
        },
      },
      productImageUrl: "image.jpg",
    };

    const res = mockRes();

    await createNewIssue(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to submit form",
      error: "DB error",
    });
  });

});

/* =====================================================
   TESTS: handleProdResponse
===================================================== */
describe("handleProdResponse Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: {
        team: { flag: "INTERNAL" },
      },
      params: {
        id: "form123",
      },
      body: {
        data: {
          measuresReport: {
            comment: "All checks done",
          },
        },
      },
      prodFileUrl: "https://s3.aws.com/prod-report.pdf",
    };

    res = mockRes();

    jest.clearAllMocks();
  });

  // --------------------
  // SUCCESS CASE
  // --------------------
  it("should submit production response successfully", async () => {
    const saveMock = jest.fn();

    Form.findById.mockResolvedValue({
      formData: {
        existingField: "value",
      },
      status: "draft",
      save: saveMock,
    });

    await handleProdResponse(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Production response submitted successfully",
      }),
    );
  });

  // --------------------
  // FORM NOT FOUND
  // --------------------
  it("should return 404 if form not found", async () => {
    Form.findById.mockResolvedValue(null);

    await handleProdResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form not found",
    });
  });

  // --------------------
  // UNAUTHORIZED TEAM
  // --------------------
  it("should return 403 if team is not INTERNAL", async () => {
    req.user.team.flag = "EXTERNAL";

    Form.findById.mockResolvedValue({
      formData: {},
      save: jest.fn(),
    });

    await handleProdResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Production team can submit measures report",
    });
  });

  // --------------------
  // BODY DATA MISSING
  // --------------------
  it("should handle missing req.body.data safely", async () => {
    req.body = {};

    const saveMock = jest.fn();

    Form.findById.mockResolvedValue({
      formData: {},
      save: saveMock,
    });

    await handleProdResponse(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // --------------------
  // SERVER ERROR
  // --------------------
  it("should return 500 if error occurs", async () => {
    Form.findById.mockRejectedValue(new Error("DB error"));

    await handleProdResponse(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to handle production response",
      error: "DB error",
    });
  });
});

// =========================
// TESTS: handleApprove
// =========================
describe("handleApprove Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        team: { flag: "QA" },
      },
      body: {
        formId: "form123",
        data: {
          resultsOfMeasuresEnforcement: {
            comment: "Verified and approved",
          },
        },
      },
    };

    res = mockRes();
  });

  // --------------------
  // UNAUTHORIZED TEAM
  // --------------------
  it("should return 403 if user is not from QA team", async () => {
    req.user.team.flag = "INTERNAL";

    await handleApprove(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Quality team can approve forms",
    });
  });

  // --------------------
  // FORM ID MISSING
  // --------------------
  it("should return 400 if formId is missing", async () => {
    req.body.formId = undefined;

    await handleApprove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form ID is required",
    });
  });

  // --------------------
  // FORM NOT FOUND
  // --------------------
  it("should return 404 if form does not exist", async () => {
    Form.findById.mockResolvedValue(null);

    await handleApprove(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form not found",
    });
  });

  // --------------------
  // SUCCESS CASE
  // --------------------
  it("should approve the form successfully", async () => {
    const saveMock = jest.fn();

    Form.findById.mockResolvedValue({
      formData: {
        existingField: "value",
      },
      status: "pending_quality",
      save: saveMock,
    });

    await handleApprove(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Issue approved successfully",
        form: expect.any(Object),
      }),
    );
  });

  // --------------------
  // SERVER ERROR
  // --------------------
  it("should return 500 if an error occurs", async () => {
    Form.findById.mockRejectedValue(new Error("DB failure"));

    await handleApprove(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to handle approval",
      error: "DB failure",
    });
  });
});

// =========================
// TESTS: handleReject
// =========================
describe("handleReject Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        team: { flag: "QA" },
      },
      body: {
        formId: "form123",
        data: {
          resultsOfMeasuresEnforcement: { comment: "Failed QA checks" },
        },
      },
    };

    res = mockRes();
  });

  // --------------------
  // UNAUTHORIZED TEAM
  // --------------------
  it("should return 403 if user is not QA", async () => {
    req.user.team.flag = "INTERNAL";

    await handleReject(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Quality team can reject forms",
    });
  });

  // --------------------
  // FORM ID MISSING
  // --------------------
  it("should return 400 if formId is missing", async () => {
    req.body.formId = undefined;

    await handleReject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form ID is required",
    });
  });

  // --------------------
  // FORM NOT FOUND
  // --------------------
  it("should return 404 if form does not exist", async () => {
    Form.findById.mockResolvedValue(null);

    await handleReject(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Form not found",
    });
  });

  // --------------------
  // SUCCESS CASE
  // --------------------
  it("should reject the form successfully and add to history", async () => {
    const saveMock = jest.fn();

    Form.findById.mockResolvedValue({
      formData: { measuresReport: { comment: "Prod checked" } },
      history: [],
      save: saveMock,
      status: "pending_quality",
    });

    await handleReject(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(saveMock).toHaveBeenCalled();

    // history is updated
    const savedForm = saveMock.mock.calls[0][0]; // although save() is empty, the object is mutated directly
    // Check the form object returned in res.json
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Issue rejected successfully",
        form: expect.any(Object),
      }),
    );

    const returnedForm = res.json.mock.calls[0][0].form;
    expect(returnedForm.history.length).toBe(1);
    expect(returnedForm.history[0].cycle).toBe(1);
    expect(returnedForm.status).toBe("pending_prod");
    expect(returnedForm.formData.resultsOfMeasuresEnforcement).toEqual(
      req.body.data.resultsOfMeasuresEnforcement,
    );
  });

  // --------------------
  // SERVER ERROR
  // --------------------
  it("should return 500 if an error occurs", async () => {
    Form.findById.mockRejectedValue(new Error("DB failure"));

    await handleReject(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to handle rejection",
      error: "DB failure",
    });
  });
});


// =========================
// TESTS: handleFinalSubmit
// =========================
describe("handleFinalSubmit Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { team: { flag: "QA" } },
      body: {
        formId: "form123",
        data: {
          resultsOfMeasuresEffect: { comment: "Everything OK" },
        },
      },
    };

    res = mockRes();
  });

  // --------------------
  // FORM NOT FOUND
  // --------------------
  it("should return 404 if form does not exist", async () => {
    Form.findById.mockResolvedValue(null);

    await handleFinalSubmit(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // --------------------
  // FORM NOT APPROVED OR UNAUTHORIZED TEAM
  // --------------------
  it("should return 400 if form is not approved or user not QA/IT", async () => {
    Form.findById.mockResolvedValue({ status: "pending_quality" });
    req.user.team.flag = "INTERNAL";

    await handleFinalSubmit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only approved forms can be finalized",
    });
  });

  // --------------------
  // SUCCESS CASE
  // --------------------
  it("should finalize an approved form successfully", async () => {
    Form.findById.mockResolvedValue({ status: "approved" });

    const updatedFormMock = {
      formData: { resultsOfMeasuresEffect: { comment: "Everything OK" } },
      status: "finished",
    };

    Form.findByIdAndUpdate.mockResolvedValue(updatedFormMock);

    await handleFinalSubmit(req, res);

    expect(Form.findById).toHaveBeenCalledWith("form123");
    expect(Form.findByIdAndUpdate).toHaveBeenCalledWith(
      "form123",
      expect.objectContaining({
        $set: expect.objectContaining({
          "formData.resultsOfMeasuresEffect": req.body.data.resultsOfMeasuresEffect,
          status: "finished",
        }),
      }),
      { new: true, runValidators: true },
    );

    expect(logger.info).toHaveBeenCalledWith(updatedFormMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Issue workflow finished successfully",
      form: updatedFormMock,
    });
  });

  // --------------------
  // UPDATED FORM NOT FOUND (after update)
  // --------------------
  it("should return 404 if updated form is null", async () => {
    Form.findById.mockResolvedValue({ status: "approved" });
    Form.findByIdAndUpdate.mockResolvedValue(null);

    await handleFinalSubmit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // --------------------
  // SERVER ERROR
  // --------------------
  it("should return 500 if an error occurs", async () => {
    Form.findById.mockRejectedValue(new Error("DB failure"));

    await handleFinalSubmit(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to end the workflow",
      error: "DB failure",
    });
  });
});


// =========================
// TESTS: getAllForms
// =========================
describe("getAllForms Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
  });

  const chainableMock = () => ({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  });

  // --------------------
  // NO FORMS FOUND
  // --------------------
  it("should return empty array if no forms are found", async () => {
    const mockChain = chainableMock();
    mockChain.lean.mockReturnValue([]);
    Form.find.mockReturnValue(mockChain);

    req = { user: { team: { flag: "INTERNAL", supplierCode: "SUP123" }, role: "user" } };

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({ "formData.defectivenessDetail.supplier": "SUP123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "No forms found",
      count: 0,
      forms: [],
    });
  });

  // --------------------
  // SUCCESS: FORMS FOUND
  // --------------------
  it("should return forms successfully", async () => {
    const mockForms = [
      { _id: "1", formData: { field: "value" } },
      { _id: "2", formData: { field: "value2" } },
    ];

    const mockChain = chainableMock();
    mockChain.lean.mockReturnValue(mockForms);
    Form.find.mockReturnValue(mockChain);

    req = { user: { team: { flag: "QA" }, role: "user" } };

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forms fetched successfully",
      count: mockForms.length,
      forms: mockForms,
    });
  });

  // --------------------
  // ADMIN USER
  // --------------------
  it("should fetch all forms for admin role", async () => {
    const mockForms = [{ _id: "admin1" }];

    const mockChain = chainableMock();
    mockChain.lean.mockReturnValue(mockForms);
    Form.find.mockReturnValue(mockChain);

    req = { user: { team: { flag: "EXTERNAL" }, role: "admin" } };

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forms fetched successfully",
      count: mockForms.length,
      forms: mockForms,
    });
  });

  // --------------------
  // SERVER ERROR
  // --------------------
  it("should return 500 on server error", async () => {
    Form.find.mockImplementation(() => { throw new Error("DB failure"); });

    req = { user: { team: { flag: "QA" }, role: "user" } };

    await getAllForms(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch forms",
      error: "DB failure",
    });
  });
});
