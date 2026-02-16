import { jest } from "@jest/globals";
import { describe, it, expect, beforeEach } from "@jest/globals";


jest.unstable_mockModule("../../Models/form.models.js", () => {
  let _formImpl = null;   // ← lives in the factory closure (the only copy that matters)

  const MockForm = jest.fn(function (...args) {
    
    if (_formImpl) _formImpl(this, ...args);
  });
  MockForm.find              = jest.fn();
  MockForm.findById          = jest.fn();
  MockForm.findByIdAndUpdate = jest.fn();

  // Exported helpers so tests can reach into this closure
  MockForm._setImpl   = (fn) => { _formImpl = fn; };
  MockForm._clearImpl = ()   => { _formImpl = null; };

  return { default: MockForm };
});

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Utils/generateReceivingNo.js", () => ({
  generateReceivingNo: jest.fn(),
}));

/* =========================
   IMPORT MOCKED MODULES
========================= */

const { default: Form }         = await import("../../Models/form.models.js");
const { default: logger }       = await import("../../../Config/logger.js");
const { generateReceivingNo }   = await import("../../Utils/generateReceivingNo.js");

const {
  createNewIssue,
  handleProdResponse,
  handleApprove,
  handleReject,
  handleFinalSubmit,
  getAllForms,
  getNextReceivingNo,
} = await import("../../Controllers/form.controller.js");

/* =========================
   HELPERS
========================= */

/** Chainable mock res object */
const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

/**
 * Build a mock Mongoose form document with save() and mutable formData/status.
 * history defaults to [] so tests can pre-seed it as needed.
 */
const makeMockForm = (overrides = {}) => ({
  _id: "form-id-123",
  status: "pending_prod",
  history: [],
  formData: {
    issuingSection: {},
    defectivenessDetail: {},
    measuresReport: { detail: "old-report" },
    resultsOfMeasuresEnforcement: null,
  },
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

/** Build a chainable Form.find mock (populate × N + lean) */
const mockFormFindChain = (result) => {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
  Form.find.mockReturnValue(chain);
};

/* =====================================================
   SUITE: createNewIssue
   Branches:
   [A] req.body.data missing  → data stays {}
   [B] data empty             → 400
   [C] team.flag === "QA"     → 201
   [D] team.flag !== "QA"     → 403
   [E] DB throws              → 500
===================================================== */
describe("createNewIssue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Form._clearImpl(); // reset constructor delegation between tests
  });

  // Shared valid payload
  const validData = {
    issuingSection: { dept: "QA" },
    defectivenessDetail: { part: "P01" },
    qualityCheckComment: "OK",
  };

  // [B] No data at all → 400
  it("should return 400 when form data is missing", async () => {
    const req = {
      user: { team: { flag: "QA" } },
      productImageUrl: null,
      body: {},
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Form data is required" });
  });

  // [B] data is present but empty object → 400
  it("should return 400 when req.body.data is an empty object", async () => {
    const req = {
      user: { team: { flag: "QA" } },
      productImageUrl: null,
      body: { data: {} },
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Form data is required" });
  });

  // [C] QA team, data present → form saved, 201
  it("should create and save a form for QA team and return 201", async () => {
    // Mock the receiving number
    generateReceivingNo.mockResolvedValue("RN-001");

    // Create a fake Form instance with save
    const saveMock = jest.fn().mockResolvedValue(true);

    // Replace Form module with a constructor that always returns this instance
    Form.mockImplementation(function () {
      this.save = saveMock;
      this.formData = {};
      this.status = "";
    });

    const req = {
      user: { team: { flag: "QA" } },
      productImageUrl: "http://img.test/photo.jpg",
      body: { data: validData },
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(generateReceivingNo).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Issue submitted successfully" }),
    );
  });



  // [A] req.body.data undefined → data assigned to {} → hits 400 (empty-data guard)
  it("should handle missing req.body.data gracefully (defaults to empty object)", async () => {
    const req = {
      user: { team: { flag: "QA" } },
      productImageUrl: null,
      body: { data: undefined },
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // [D] Non-QA team → 403
  it("should return 403 when team is not QA", async () => {
    const req = {
      user: { team: { flag: "INTERNAL" } },
      productImageUrl: null,
      body: { data: validData },
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Quality team can submit new forms",
    });
  });

  // [E] generateReceivingNo throws → 500
  it("should return 500 when an error is thrown", async () => {
    generateReceivingNo.mockRejectedValue(new Error("DB failure"));

    const req = {
      user: { team: { flag: "QA" } },
      productImageUrl: null,
      body: { data: validData },
    };
    const res = mockRes();

    await createNewIssue(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to submit form" }),
    );
  });
});

/* =====================================================
   SUITE: handleProdResponse
   Branches:
   [A] req.body.data missing  → data stays {}
   [B] form not found         → 404
   [C] team.flag !== INTERNAL → 403
   [D] happy path             → 200
   [E] DB throws              → 500
===================================================== */
describe("handleProdResponse", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = (overrides = {}) => ({
    user: { team: { flag: "INTERNAL" } },
    params: { id: "form-id-123" },
    prodFileUrl: "http://files.test/prod.pdf",
    body: { data: { measuresReport: { action: "fixed" } } },
    ...overrides,
  });

  // [B] Form not found → 404
  it("should return 404 when form is not found", async () => {
    Form.findById.mockResolvedValue(null);
    const res = mockRes();

    await handleProdResponse(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // [C] Wrong team → 403
  it("should return 403 when team is not INTERNAL", async () => {
    Form.findById.mockResolvedValue(makeMockForm());
    const res = mockRes();

    await handleProdResponse(baseReq({ user: { team: { flag: "QA" } } }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Production team can submit measures report",
    });
  });

  // [D] Happy path → 200
  it("should update form and return 200 for INTERNAL team", async () => {
    const mockForm = makeMockForm();
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleProdResponse(baseReq(), res);

    expect(mockForm.save).toHaveBeenCalled();
    expect(mockForm.status).toBe("pending_quality");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Production response submitted successfully" }),
    );
  });

  // [A] req.body.data missing → data = {} → still saves
  it("should handle missing req.body.data and still succeed", async () => {
    const mockForm = makeMockForm();
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleProdResponse(
      baseReq({ body: {} }),
      res,
    );

    expect(mockForm.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [E] DB throws → 500
  it("should return 500 on unexpected error", async () => {
    Form.findById.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await handleProdResponse(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to handle production response" }),
    );
  });
});

/* =====================================================
   SUITE: handleApprove
   Branches:
   [A] req.body.data missing  → data stays {}
   [B] team.flag !== "QA"     → 403
   [C] !formId                → 400
   [D] form not found         → 404
   [E] happy path             → 200
   [F] DB throws              → 500
===================================================== */
describe("handleApprove", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = (overrides = {}) => ({
    user: { team: { flag: "QA" } },
    body: {
      formId: "form-id-123",
      data: { resultsOfMeasuresEnforcement: { verdict: "pass" } },
    },
    ...overrides,
  });

  // [B] Non-QA team → 403
  it("should return 403 when team is not QA", async () => {
    const res = mockRes();

    await handleApprove(
      baseReq({ user: { team: { flag: "INTERNAL" } } }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Quality team can approve forms",
    });
  });

  // [C] formId missing → 400
  it("should return 400 when formId is missing", async () => {
    const res = mockRes();

    await handleApprove(
      baseReq({ body: { data: {} } }), // no formId
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Form ID is required" });
  });

  // [D] Form not found → 404
  it("should return 404 when form is not found", async () => {
    Form.findById.mockResolvedValue(null);
    const res = mockRes();

    await handleApprove(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // [E] Happy path → 200
  it("should approve the form and return 200", async () => {
    const mockForm = makeMockForm();
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleApprove(baseReq(), res);

    expect(mockForm.save).toHaveBeenCalled();
    expect(mockForm.status).toBe("approved");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Issue approved successfully" }),
    );
  });

  // [A] req.body.data missing → data = {} → merges undefined gracefully
  it("should handle missing req.body.data and still approve", async () => {
    const mockForm = makeMockForm();
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleApprove(
      baseReq({ body: { formId: "form-id-123" } }), // no data key
      res,
    );

    expect(mockForm.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [F] DB throws → 500
  it("should return 500 on unexpected error", async () => {
    Form.findById.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await handleApprove(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to handle approval" }),
    );
  });
});

/* =====================================================
   SUITE: handleReject
   Branches:
   [A] req.body.data missing    → data stays {}
   [B] team.flag !== "QA"       → 403
   [C] !formId                  → 400
   [D] form not found           → 404
   [E] history empty            → nextCycle = 1
   [F] history non-empty        → nextCycle = last.cycle + 1
   [G] happy path               → 200
   [H] DB throws                → 500
===================================================== */
describe("handleReject", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = (overrides = {}) => ({
    user: { team: { flag: "QA" } },
    body: {
      formId: "form-id-123",
      data: { resultsOfMeasuresEnforcement: { verdict: "fail" } },
    },
    ...overrides,
  });

  // [B] Non-QA team → 403
  it("should return 403 when team is not QA", async () => {
    const res = mockRes();

    await handleReject(
      baseReq({ user: { team: { flag: "INTERNAL" } } }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only Quality team can reject forms",
    });
  });

  // [C] formId missing → 400
  it("should return 400 when formId is missing", async () => {
    const res = mockRes();

    await handleReject(
      baseReq({ body: { data: {} } }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Form ID is required" });
  });

  // [D] Form not found → 404
  it("should return 404 when form is not found", async () => {
    Form.findById.mockResolvedValue(null);
    const res = mockRes();

    await handleReject(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // [E] Empty history → nextCycle = 1
  it("should set nextCycle to 1 when history is empty", async () => {
    const mockForm = makeMockForm({ history: [] });
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleReject(baseReq(), res);

    expect(mockForm.history).toHaveLength(1);
    expect(mockForm.history[0].cycle).toBe(1);
    expect(mockForm.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [F] Non-empty history → nextCycle = last.cycle + 1
  it("should increment cycle correctly when history already has entries", async () => {
    const mockForm = makeMockForm({
      history: [
        { cycle: 1, data: {} },
        { cycle: 2, data: {} },
      ],
    });
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleReject(baseReq(), res);

    expect(mockForm.history).toHaveLength(3);
    expect(mockForm.history[2].cycle).toBe(3);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [G] Happy path verifies full response shape
  it("should reject form, push history entry, set status to pending_prod, and return 200", async () => {
    const mockForm = makeMockForm();
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleReject(baseReq(), res);

    expect(mockForm.status).toBe("pending_prod");
    expect(mockForm.history[0]).toMatchObject({ cycle: 1 });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Issue rejected successfully" }),
    );
  });

  // [A] req.body.data missing → data = {} → still saves
  it("should handle missing req.body.data and still reject", async () => {
    const mockForm = makeMockForm();
    Form.findById.mockResolvedValue(mockForm);
    const res = mockRes();

    await handleReject(
      baseReq({ body: { formId: "form-id-123" } }),
      res,
    );

    expect(mockForm.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [H] DB throws → 500
  it("should return 500 on unexpected error", async () => {
    Form.findById.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await handleReject(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to handle rejection" }),
    );
  });
});

/* =====================================================
   SUITE: handleFinalSubmit
   Branches:
   [A] req.body.data missing                          → data stays {}
   [B] Form.findById → null                           → 404
   [C] status !== "approved" (team is QA)             → 400
   [D] status === "approved" BUT team not QA or IT    → 400
   [E] status approved + team QA                      → 200
   [F] status approved + team IT                      → 200
   [G] findByIdAndUpdate returns null                 → 404
   [H] DB throws                                      → 500
===================================================== */
describe("handleFinalSubmit", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = (overrides = {}) => ({
    user: { team: { flag: "QA" } },
    body: {
      formId: "form-id-123",
      data: { resultsOfMeasuresEffect: { summary: "all good" } },
    },
    ...overrides,
  });

  // [B] Form not found (first findById) → 404
  it("should return 404 when form is not found", async () => {
    Form.findById.mockResolvedValue(null);
    const res = mockRes();

    await handleFinalSubmit(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // [C] Form found but status is not "approved" (team is QA) → 400
  it("should return 400 when form status is not approved", async () => {
    Form.findById.mockResolvedValue(
      makeMockForm({ status: "pending_prod" }),
    );
    const res = mockRes();

    await handleFinalSubmit(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only approved forms can be finalized",
    });
  });

  // [D] status "approved" but team is neither QA nor IT → 400
  it("should return 400 when form is approved but team has no permission", async () => {
    Form.findById.mockResolvedValue(makeMockForm({ status: "approved" }));
    const res = mockRes();

    await handleFinalSubmit(
      baseReq({ user: { team: { flag: "INTERNAL" } } }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Only approved forms can be finalized",
    });
  });

  // [E] status "approved" + QA team → 200
  it("should finalize form for QA team and return 200", async () => {
    Form.findById.mockResolvedValue(makeMockForm({ status: "approved" }));
    const updatedForm = makeMockForm({ status: "finished" });
    Form.findByIdAndUpdate.mockResolvedValue(updatedForm);
    const res = mockRes();

    await handleFinalSubmit(baseReq(), res);

    expect(Form.findByIdAndUpdate).toHaveBeenCalledWith(
      "form-id-123",
      expect.objectContaining({ $set: expect.objectContaining({ status: "finished" }) }),
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Issue workflow finished successfully" }),
    );
  });

  // [F] status "approved" + IT team → 200
  it("should finalize form for IT team and return 200", async () => {
    Form.findById.mockResolvedValue(makeMockForm({ status: "approved" }));
    const updatedForm = makeMockForm({ status: "finished" });
    Form.findByIdAndUpdate.mockResolvedValue(updatedForm);
    const res = mockRes();

    await handleFinalSubmit(
      baseReq({ user: { team: { flag: "IT" } } }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Issue workflow finished successfully" }),
    );
  });

  // [G] findByIdAndUpdate returns null → 404
  it("should return 404 when findByIdAndUpdate returns null", async () => {
    Form.findById.mockResolvedValue(makeMockForm({ status: "approved" }));
    Form.findByIdAndUpdate.mockResolvedValue(null);
    const res = mockRes();

    await handleFinalSubmit(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Form not found" });
  });

  // [A] req.body.data missing → data = {} → still proceeds
  it("should handle missing req.body.data and still finalize", async () => {
    Form.findById.mockResolvedValue(makeMockForm({ status: "approved" }));
    const updatedForm = makeMockForm({ status: "finished" });
    Form.findByIdAndUpdate.mockResolvedValue(updatedForm);
    const res = mockRes();

    await handleFinalSubmit(
      baseReq({ body: { formId: "form-id-123" } }), // no data
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [H] DB throws → 500
  it("should return 500 on unexpected error", async () => {
    Form.findById.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await handleFinalSubmit(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to end the workflow" }),
    );
  });
});

/* =====================================================
   SUITE: getAllForms
   Branches:
   [A] team.flag === "QA"                → filter = {}
   [B] role === "admin"                  → filter = {}
   [C] team.flag === "IT"                → filter = {}
   [D] team.flag === "INTERNAL"          → filter by supplierCode
   [E] else (unknown flag, not admin)    → filter = {}
   [F] forms.length === 0                → 200 with empty array
   [G] forms.length > 0                  → 200 with data
   [H] DB throws                         → 500
===================================================== */
describe("getAllForms", () => {
  beforeEach(() => jest.clearAllMocks());

  const fakeForms = [
    { _id: "1", formData: { issuingSection: { dept: "QA" } } },
    { _id: "2", formData: { issuingSection: { dept: "Prod" } } },
  ];

  // [A] QA team → empty filter, returns forms
  it("should return all forms for QA team with no filter", async () => {
    mockFormFindChain(fakeForms);
    const req = { user: { role: "user", team: { flag: "QA", supplierCode: null } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ count: 2, forms: fakeForms }),
    );
  });

  // [B] admin role → empty filter
  it("should return all forms for admin role with no filter", async () => {
    mockFormFindChain(fakeForms);
    const req = { user: { role: "admin", team: { flag: "INTERNAL", supplierCode: "S01" } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [C] IT team → empty filter
  it("should return all forms for IT team with no filter", async () => {
    mockFormFindChain(fakeForms);
    const req = { user: { role: "user", team: { flag: "IT", supplierCode: null } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [D] INTERNAL team → filter by supplierCode
  it("should filter forms by supplierCode for INTERNAL team", async () => {
    mockFormFindChain(fakeForms);
    const req = {
      user: { role: "user", team: { flag: "INTERNAL", supplierCode: "SUPP-42" } },
    };
    const res = mockRes();

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({
      "formData.defectivenessDetail.supplier": "SUPP-42",
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [E] Unknown flag, not admin → fallback empty filter
  it("should use empty filter for unknown team flag", async () => {
    mockFormFindChain(fakeForms);
    const req = { user: { role: "user", team: { flag: "UNKNOWN" } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(Form.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [F] No forms found → 200 with empty array message
  it("should return 200 with empty array when no forms exist", async () => {
    mockFormFindChain([]);
    const req = { user: { role: "user", team: { flag: "QA" } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "No forms found",
      count: 0,
      forms: [],
    });
  });

  // [G] Forms exist → 200 with populated data
  it("should return 200 with forms when they exist", async () => {
    mockFormFindChain(fakeForms);
    const req = { user: { role: "user", team: { flag: "QA" } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forms fetched successfully",
      count: 2,
      forms: fakeForms,
    });
  });

  // [H] DB throws → 500
  it("should return 500 on unexpected error", async () => {
    Form.find.mockImplementation(() => { throw new Error("DB crash"); });
    const req = { user: { role: "user", team: { flag: "QA" } } };
    const res = mockRes();

    await getAllForms(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Failed to fetch forms" }),
    );
  });
});

/* =====================================================
   SUITE: getNextReceivingNo
   Branches:
   [A] generateReceivingNo resolves → 200
   [B] generateReceivingNo throws   → 500
===================================================== */
describe("getNextReceivingNo", () => {
  beforeEach(() => jest.clearAllMocks());

  // [A] Resolves → returns receivingNo
  it("should return the next receiving number on success", async () => {
    generateReceivingNo.mockResolvedValue("RN-2024-042");
    const req = {};
    const res = mockRes();

    await getNextReceivingNo(req, res);

    expect(generateReceivingNo).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ receivingNo: "RN-2024-042" });
  });

  // [B] Throws → 500
  it("should return 500 when generateReceivingNo throws", async () => {
    generateReceivingNo.mockRejectedValue(new Error("Counter service down"));
    const req = {};
    const res = mockRes();

    await getNextReceivingNo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Counter service down",
    });
  });
});
