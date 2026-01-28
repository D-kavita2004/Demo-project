import { jest } from "@jest/globals";

// ============================
// MOCK MODULES
// ============================

jest.unstable_mockModule("../../Models/suppliers.models.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    exists: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/users.models.js", () => ({
  default: {
    exists: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/form.models.js", () => ({
  default: {
    exists: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    error: jest.fn(),
  },
}));

// ============================
// IMPORT AFTER MOCKING
// ============================

const { default: Supplier } = await import("../../Models/suppliers.models.js");
const { default: User } = await import("../../Models/users.models.js");
const { default: Form } = await import("../../Models/form.models.js");

const {
  createSupplier,
  getSuppliers,
  getSuppliersForUserAssignment,
  updateSupplier,
  deleteSupplier,
} = await import("../../Controllers/suppliers.controller.js");

// ============================
// COMMON MOCK RESPONSE
// ============================

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe("Suppliers Controller (ESM + unstable_mockModule)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE SUPPLIER
  // =========================
  describe("createSupplier", () => {
    it("should create supplier successfully", async () => {
      const req = { body: { supplierName: "Vendor A" } };
      const res = mockRes();

      Supplier.findOne.mockResolvedValue(null);
      Supplier.create.mockResolvedValue({
        supplierCode: "S001",
        supplierName: "vendor a",
      });

      await createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier created successfully",
        supplier: { supplierCode: "S001", supplierName: "vendor a" },
      });
    });

    it("should return 409 if supplier already exists", async () => {
      const req = { body: { supplierName: "Vendor A" } };
      const res = mockRes();

      Supplier.findOne.mockResolvedValue({ supplierName: "vendor a" });

      await createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier already exists",
      });
    });

    it("should return 500 on error", async () => {
      const req = { body: { supplierName: "Vendor A" } };
      const res = mockRes();

      Supplier.findOne.mockRejectedValue(new Error("DB error"));

      await createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // GET SUPPLIERS
  // =========================
  describe("getSuppliers", () => {
    it("should fetch INTERNAL suppliers", async () => {
      const req = {};
      const res = mockRes();

      const suppliers = [
        { supplierCode: "S001", supplierName: "vendor a" },
      ];

      Supplier.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(suppliers),
      });

      await getSuppliers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All Suppliers fetched Successfully",
        suppliers,
      });
    });

    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Supplier.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getSuppliers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // GET SUPPLIERS FOR USER ASSIGNMENT
  // =========================
  describe("getSuppliersForUserAssignment", () => {
    it("should fetch INTERNAL and QA suppliers", async () => {
      const req = {};
      const res = mockRes();

      const suppliers = [
        { supplierCode: "S001", supplierName: "vendor a" },
      ];

      Supplier.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(suppliers),
      });

      await getSuppliersForUserAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All Suppliers fetched Successfully",
        suppliers,
      });
    });

    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Supplier.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getSuppliersForUserAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // UPDATE SUPPLIER
  // =========================
  describe("updateSupplier", () => {
    it("should update supplier successfully", async () => {
      const req = {
        body: { supplierName: "Vendor B" },
        params: { supplierCode: "S001" },
      };
      const res = mockRes();

      Supplier.findOne.mockResolvedValue(null);
      Supplier.findOneAndUpdate.mockResolvedValue({
        supplierCode: "S001",
        supplierName: "vendor b",
      });

      await updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier updated successfully",
        supplier: { supplierCode: "S001", supplierName: "vendor b" },
      });
    });

    it("should return 409 if duplicate supplier name exists", async () => {
      const req = {
        body: { supplierName: "Vendor B" },
        params: { supplierCode: "S001" },
      };
      const res = mockRes();

      Supplier.findOne.mockResolvedValue({ supplierName: "vendor b" });

      await updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should return 404 if supplier not found", async () => {
      const req = {
        body: { supplierName: "Vendor B" },
        params: { supplierCode: "S001" },
      };
      const res = mockRes();

      Supplier.findOne.mockResolvedValue(null);
      Supplier.findOneAndUpdate.mockResolvedValue(null);

      await updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on update error", async () => {
      const req = {
        body: { supplierName: "Vendor B" },
        params: { supplierCode: "S001" },
      };
      const res = mockRes();

      Supplier.findOne.mockRejectedValue(new Error("DB error"));

      await updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =========================
  // DELETE SUPPLIER
  // =========================
  describe("deleteSupplier", () => {
    it("should return 404 if supplier not found", async () => {
      const req = { params: { supplierCode: "S001" } };
      const res = mockRes();

      Supplier.exists.mockResolvedValue(null);

      await deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier not found",
      });
    });

    it("should return 409 if supplier assigned to users", async () => {
      const req = { params: { supplierCode: "S001" } };
      const res = mockRes();

      Supplier.exists.mockResolvedValue({ _id: "abc123" });
      User.exists.mockResolvedValue(true);

      await deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cannot delete supplier assigned to users",
      });
    });

    it("should return 409 if issues exist for supplier", async () => {
      const req = { params: { supplierCode: "S001" } };
      const res = mockRes();

      Supplier.exists.mockResolvedValue({ _id: "abc123" });
      User.exists.mockResolvedValue(false);
      Form.exists.mockResolvedValue(true);

      await deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Some Issues are raised with this supplier",
      });
    });

    it("should delete supplier successfully", async () => {
      const req = { params: { supplierCode: "S001" } };
      const res = mockRes();

      Supplier.exists.mockResolvedValue({ _id: "abc123" });
      User.exists.mockResolvedValue(false);
      Form.exists.mockResolvedValue(false);

      await deleteSupplier(req, res);

      expect(Supplier.findByIdAndDelete).toHaveBeenCalledWith({
        _id: "abc123",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Supplier deleted successfully",
      });
    });

    it("should return 500 on delete error", async () => {
      const req = { params: { supplierCode: "S001" } };
      const res = mockRes();

      Supplier.exists.mockRejectedValue(new Error("DB error"));

      await deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
