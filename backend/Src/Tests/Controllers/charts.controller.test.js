import { jest } from "@jest/globals";

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
   TESTS: getDepartmentWiseData
========================= */

describe("getDepartmentWiseData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if startDate or endDate is missing", async () => {
    const req = { query: {} };
    const res = mockRes();

    await getDepartmentWiseData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "startDate and endDate are required",
    });
  });

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

  it("should return department-wise aggregated data", async () => {
    Form.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
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
        ]),
      }),
    });

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

/* =========================
   TESTS: getStatusWiseData
========================= */

describe("getStatusWiseData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("should return status-wise aggregated data", async () => {
  // Mock Supplier.find().lean()
    Supplier.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ supplierName: "Production" }]),
    });

    // Mock Form.find().populate().lean()
    Form.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
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
        ]),
      }),
    });

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
