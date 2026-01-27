import { jest } from "@jest/globals";

/* =========================
   MOCK MODULES (ESM)
========================= */
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

/* =========================
   IMPORT AFTER MOCKS
========================= */
const {
  createSupplier,
  getSuppliers,
  getSuppliersForUserAssignment,
  updateSupplier,
  deleteSupplier,
} = await import("../../Controllers/suppliers.controller.js");

const Supplier = (await import("../../Models/suppliers.models.js")).default;
const User = (await import("../../Models/users.models.js")).default;
const Form = (await import("../../Models/form.models.js")).default;

/* =========================
   COMMON MOCKS
========================= */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

/* =========================
   TESTS
========================= */

describe("createSupplier", () => {
  it("should return 409 if supplier already exists", async () => {
    Supplier.findOne.mockResolvedValue({ supplierName: "abc" });

    const req = { body: { supplierName: "ABC" } };
    const res = mockResponse();

    await createSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier already exists",
    });
  });

  it("should create a new supplier", async () => {
    Supplier.findOne.mockResolvedValue(null);
    Supplier.create.mockResolvedValue({
      supplierCode: "S001",
      supplierName: "abc",
    });

    const req = { body: { supplierName: "ABC" } };
    const res = mockResponse();

    await createSupplier(req, res);

    expect(Supplier.create).toHaveBeenCalledWith({ supplierName: "abc" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier created successfully",
      supplier: { supplierCode: "S001", supplierName: "abc" },
    });
  });
});

describe("getSuppliers", () => {
  it("should return all internal suppliers", async () => {
    const mockSuppliers = [{ supplierCode: "S001", supplierName: "abc" }];
    Supplier.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockSuppliers),
    });

    const res = mockResponse();
    await getSuppliers({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All Suppliers fetched Successfully",
      suppliers: mockSuppliers,
    });
  });
});

describe("getSuppliersForUserAssignment", () => {
  it("should return all internal and QA suppliers", async () => {
    const mockSuppliers = [{ supplierCode: "S001", supplierName: "abc" }];
    Supplier.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockSuppliers),
    });

    const res = mockResponse();
    await getSuppliersForUserAssignment({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All Suppliers fetched Successfully",
      suppliers: mockSuppliers,
    });
  });
});

describe("updateSupplier", () => {
  it("should return 409 if duplicate supplier exists", async () => {
    Supplier.findOne.mockResolvedValue({ supplierName: "abc" });

    const req = { body: { supplierName: "ABC" }, params: { supplierCode: "S001" } };
    const res = mockResponse();

    await updateSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier name already exists",
    });
  });

  it("should return 404 if supplier not found", async () => {
    Supplier.findOne.mockResolvedValue(null);
    Supplier.findOneAndUpdate.mockResolvedValue(null);

    const req = { body: { supplierName: "ABC" }, params: { supplierCode: "S001" } };
    const res = mockResponse();

    await updateSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier not found",
    });
  });

  it("should update supplier successfully", async () => {
    Supplier.findOne.mockResolvedValue(null);
    Supplier.findOneAndUpdate.mockResolvedValue({
      supplierCode: "S001",
      supplierName: "abc",
    });

    const req = { body: { supplierName: "ABC" }, params: { supplierCode: "S001" } };
    const res = mockResponse();

    await updateSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier updated successfully",
      supplier: { supplierCode: "S001", supplierName: "abc" },
    });
  });
});

describe("deleteSupplier", () => {
  it("should return 404 if supplier not found", async () => {
    Supplier.exists.mockResolvedValue(null);

    const req = { params: { supplierCode: "S001" } };
    const res = mockResponse();

    await deleteSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier not found",
    });
  });

  it("should return 409 if supplier assigned to user", async () => {
    Supplier.exists.mockResolvedValue({ _id: "abcid" });
    User.exists.mockResolvedValue(true);

    const req = { params: { supplierCode: "S001" } };
    const res = mockResponse();

    await deleteSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot delete supplier assigned to users",
    });
  });

  it("should return 409 if issues exist for supplier", async () => {
    Supplier.exists.mockResolvedValue({ _id: "abcid" });
    User.exists.mockResolvedValue(false);
    Form.exists.mockResolvedValue(true);

    const req = { params: { supplierCode: "S001" } };
    const res = mockResponse();

    await deleteSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some Issues are raised with this supplier",
    });
  });

  it("should delete supplier successfully", async () => {
    Supplier.exists.mockResolvedValue({ _id: "abcid" });
    User.exists.mockResolvedValue(false);
    Form.exists.mockResolvedValue(false);
    Supplier.findByIdAndDelete.mockResolvedValue({ _id: "abcid" });

    const req = { params: { supplierCode: "S001" } };
    const res = mockResponse();

    await deleteSupplier(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier deleted successfully",
    });
  });
});
