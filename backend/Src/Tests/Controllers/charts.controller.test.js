import { jest } from "@jest/globals";
import { describe, it, expect, beforeEach } from "@jest/globals";
/* =========================
   MOCK MODULES (ESM)
========================= */

jest.unstable_mockModule("../../Models/form.models.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/suppliers.models.js", () => ({
  default: {
    find: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    error: jest.fn(),
  },
}));

/* =========================
   IMPORT MOCKED MODULES
========================= */

const { default: Form } = await import("../../Models/form.models.js");
const { default: Supplier } = await import("../../Models/suppliers.models.js");
const { default: logger } = await import("../../../Config/logger.js");

const {
  getDepartmentWiseData,
  getStatusWiseData,
} = await import("../../Controllers/charts.controller.js");

/* =========================
   HELPER: MOCK RESPONSE
========================= */

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

/* =========================
   HELPER: MOCK Form.find chain
========================= */

const mockFormFind = (resolvedForms) => {
  Form.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(resolvedForms),
    }),
  });
};

/* =========================
   HELPER: MOCK Supplier.find chain
========================= */

const mockSupplierFind = (resolvedSuppliers) => {
  Supplier.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue(resolvedSuppliers),
  });
};

/* ================================================
   TESTS: getDepartmentWiseData
   Branches to cover:
   [1] Missing startDate or endDate → 400
   [2] Invalid date format → 400
   [3] Forms with valid supplier → aggregated 200
   [4] Form with null/missing supplier → skipped   ← NEW
   [5] DB throws → 500
================================================ */

describe("getDepartmentWiseData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // [1] Missing query params
  it("should return 400 if startDate or endDate is missing", async () => {
    const req = { query: {} };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "startDate and endDate are required",
    });
  });

  // [1b] Only startDate provided
  it("should return 400 if only startDate is provided", async () => {
    const req = { query: { startDate: "2024-01-01" } };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "startDate and endDate are required",
    });
  });

  // [1c] Only endDate provided
  it("should return 400 if only endDate is provided", async () => {
    const req = { query: { endDate: "2024-01-31" } };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "startDate and endDate are required",
    });
  });

  // [2] Invalid date format
  it("should return 400 for invalid date format", async () => {
    const req = {
      query: { startDate: "invalid", endDate: "invalid" },
    };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid date format",
    });
  });

  // [3] Happy path — valid suppliers, correct aggregation
  it("should return department-wise aggregated data", async () => {
    mockFormFind([
      {
        formData: {
          defectivenessDetail: {
            supplier: { supplierName: "Production" },
          },
        },
      },
      {
        formData: {
          defectivenessDetail: {
            supplier: { supplierName: "Production" },
          },
        },
      },
      {
        formData: {
          defectivenessDetail: {
            supplier: { supplierName: "QA" },
          },
        },
      },
    ]);

    const req = {
      query: { startDate: "2024-01-01", endDate: "2024-01-31" },
    };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 3,
      data: [
        { name: "Production", value: 2 },
        { name: "QA", value: 1 },
      ],
    });
  });

  // [4] ← NEW: Form where supplier is null/undefined → should be skipped, not counted
  it("should skip forms with no supplier and only count forms with a valid supplier", async () => {
    mockFormFind([
      {
        // valid supplier
        formData: {
          defectivenessDetail: {
            supplier: { supplierName: "Production" },
          },
        },
      },
      {
        // supplier is null (populate returned nothing)
        formData: {
          defectivenessDetail: {
            supplier: null,
          },
        },
      },
      {
        // supplier is undefined (field missing entirely)
        formData: {
          defectivenessDetail: {},
        },
      },
    ]);

    const req = {
      query: { startDate: "2024-01-01", endDate: "2024-01-31" },
    };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 1,
      data: [{ name: "Production", value: 1 }],
    });
  });

  // [3b] No forms in range → empty data, total 0
  it("should return empty data when no forms exist in the date range", async () => {
    mockFormFind([]);

    const req = {
      query: { startDate: "2024-01-01", endDate: "2024-01-31" },
    };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ total: 0, data: [] });
  });

  // [5] DB error → 500
  it("should return 500 on server error", async () => {
    Form.find.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const req = {
      query: { startDate: "2024-01-01", endDate: "2024-01-31" },
    };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});

/* ================================================
   TESTS: getStatusWiseData
   Branches to cover:
   [1] Invalid date format → 400
   [2] No dates provided → fetches all forms
   [3] Valid dates provided → applies dateFilter    ← NEW
   [4] All known statuses mapped correctly
   [5] Unknown status → skipped                    ← NEW
   [6] pending_prod with null supplier → skipped   ← NEW
   [7] DB throws → 500
================================================ */

describe("getStatusWiseData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // [1] Invalid date format
  it("should return 400 for invalid date format", async () => {
    const req = {
      query: { startDate: "bad", endDate: "bad" },
    };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid date format",
    });
  });

  // [2] No date filter — all statuses
  it("should return status-wise aggregated data with no date filter", async () => {
    mockSupplierFind([{ supplierName: "Production" }]);
    mockFormFind([
      { status: "pending_quality" },
      { status: "finished" },
      { status: "approved" },
      {
        status: "pending_prod",
        formData: {
          defectivenessDetail: {
            supplier: { supplierName: "Production" },
          },
        },
      },
    ]);

    const req = { query: {} };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 4,
      data: [
        { category: "QA Review", count: 1 },
        { category: "Finished", count: 1 },
        { category: "Approved", count: 1 },
        { category: "Production Review", count: 1 },
      ],
    });
  });

  // [3] ← NEW: Valid date filter is applied — verifies the dateFilter branch executes
  it("should apply date filter when valid startDate and endDate are provided", async () => {
    mockSupplierFind([{ supplierName: "QA" }]);
    mockFormFind([
      { status: "pending_quality" },
      { status: "finished" },
    ]);

    const req = {
      query: { startDate: "2024-03-01", endDate: "2024-03-31" },
    };
    const res = mockRes();

    await getStatusWiseData(req, res);

    // Form.find should have been called with a createdAt filter object (not empty {})
    const callArg = Form.find.mock.calls[0][0];
    expect(callArg).toHaveProperty("createdAt");
    expect(callArg.createdAt).toHaveProperty("$gte");
    expect(callArg.createdAt).toHaveProperty("$lte");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 2,
      data: [
        { category: "QA Review", count: 1 },
        { category: "Finished", count: 1 },
        { category: "Approved", count: 0 },
        { category: "QA Review", count: 0 }, // supplier-based entry
      ],
    });
  });

  // [5] ← NEW: Unknown/unrecognised status → form is skipped entirely
  it("should skip forms with an unrecognised status", async () => {
    mockSupplierFind([{ supplierName: "Production" }]);
    mockFormFind([
      { status: "pending_quality" },
      { status: "unknown_status" },   // ← triggers the `if (!categoryToUpdate) return;` branch
      { status: "draft" },            // another unknown
    ]);

    const req = { query: {} };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 1,
      data: [
        { category: "QA Review", count: 1 },
        { category: "Finished", count: 0 },
        { category: "Approved", count: 0 },
        { category: "Production Review", count: 0 },
      ],
    });
  });

  // [6] ← NEW: pending_prod but supplier is null → category becomes "undefined Review" → no match → skipped
  it("should skip pending_prod forms where supplier is null", async () => {
    mockSupplierFind([{ supplierName: "Production" }]);
    mockFormFind([
      {
        status: "pending_prod",
        formData: {
          defectivenessDetail: {
            supplier: null, // ← supplier not populated
          },
        },
      },
    ]);

    const req = { query: {} };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 0,
      data: [
        { category: "QA Review", count: 0 },
        { category: "Finished", count: 0 },
        { category: "Approved", count: 0 },
        { category: "Production Review", count: 0 },
      ],
    });
  });

  // [4b] Multiple forms with same status — counts accumulate correctly
  it("should correctly accumulate counts for repeated statuses", async () => {
    mockSupplierFind([]);
    mockFormFind([
      { status: "finished" },
      { status: "finished" },
      { status: "finished" },
      { status: "approved" },
    ]);

    const req = { query: {} };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 4,
      data: [
        { category: "QA Review", count: 0 },
        { category: "Finished", count: 3 },
        { category: "Approved", count: 1 },
      ],
    });
  });

  // [4c] Multiple internal suppliers appear in baseStatusList
  it("should include all internal suppliers in the status list", async () => {
    mockSupplierFind([
      { supplierName: "Production" },
      { supplierName: "Warehouse" },
    ]);
    mockFormFind([
      {
        status: "pending_prod",
        formData: {
          defectivenessDetail: {
            supplier: { supplierName: "Warehouse" },
          },
        },
      },
    ]);

    const req = { query: {} };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 1,
      data: [
        { category: "QA Review", count: 0 },
        { category: "Finished", count: 0 },
        { category: "Approved", count: 0 },
        { category: "Production Review", count: 0 },
        { category: "Warehouse Review", count: 1 },
      ],
    });
  });

  // [7] DB throws → 500
  it("should return 500 on server error", async () => {
    Supplier.find.mockImplementation(() => {
      throw new Error("DB error");
    });

    const req = { query: {} };
    const res = mockRes();

    await getStatusWiseData(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});