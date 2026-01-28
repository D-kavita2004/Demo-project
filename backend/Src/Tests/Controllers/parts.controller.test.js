// 
import { jest } from "@jest/globals";

// ============================
// MOCK MODULES
// ============================

jest.unstable_mockModule("../../Models/parts.models.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
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

const { default: Part } = await import("../../Models/parts.models.js");
const { default: Form } = await import("../../Models/form.models.js");

const {
  createPart,
  getParts,
  updatePart,
  deletePart,
} = await import("../../Controllers/parts.controller.js");

// ============================
// COMMON MOCK RESPONSE
// ============================

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe("Parts Controller (ESM + unstable_mockModule)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE PART
  // =========================
  describe("createPart", () => {
    it("should create a part successfully", async () => {
      const req = { body: { partName: "Bolt" } };
      const res = mockRes();

      Part.findOne.mockResolvedValue(null);
      Part.create.mockResolvedValue({
        partCode: "P001",
        partName: "bolt",
      });

      await createPart(req, res);

      expect(Part.findOne).toHaveBeenCalledWith({ partName: "bolt" });
      expect(Part.create).toHaveBeenCalledWith({ partName: "bolt" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part created successfully",
        part: { partCode: "P001", partName: "bolt" },
      });
    });

    it("should return 409 if part already exists", async () => {
      const req = { body: { partName: "Bolt" } };
      const res = mockRes();

      Part.findOne.mockResolvedValue({ partName: "bolt" });

      await createPart(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part already exists",
      });
    });

    it("should return 500 on error", async () => {
      const req = { body: { partName: "Bolt" } };
      const res = mockRes();

      Part.findOne.mockRejectedValue(new Error("DB error"));

      await createPart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // GET PARTS
  // =========================
  describe("getParts", () => {
    it("should fetch all parts", async () => {
      const req = {};
      const res = mockRes();

      const parts = [{ partCode: "P001", partName: "bolt" }];

      Part.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(parts),
      });

      await getParts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All Parts fetched Successfully",
        parts,
      });
    });

    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Part.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getParts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // UPDATE PART
  // =========================
  describe("updatePart", () => {
    it("should update part successfully", async () => {
      const req = {
        body: { partName: "Nut" },
        params: { partCode: "P001" },
      };
      const res = mockRes();

      Part.findOne.mockResolvedValue(null);
      Part.findOneAndUpdate.mockResolvedValue({
        partCode: "P001",
        partName: "nut",
      });

      await updatePart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part updated successfully",
        part: { partCode: "P001", partName: "nut" },
      });
    });

    it("should return 409 if duplicate part exists", async () => {
      const req = {
        body: { partName: "Nut" },
        params: { partCode: "P001" },
      };
      const res = mockRes();

      Part.findOne.mockResolvedValue({ partName: "nut" });

      await updatePart(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part name already exists",
      });
    });

    it("should return 404 if part not found", async () => {
      const req = {
        body: { partName: "Nut" },
        params: { partCode: "P001" },
      };
      const res = mockRes();

      Part.findOne.mockResolvedValue(null);
      Part.findOneAndUpdate.mockResolvedValue(null);

      await updatePart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part not found",
      });
    });
    it("should return 500 on error", async () => {
      const req = { body: { partName: "Bolt" } };
      const res = mockRes();

      Part.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

      await updatePart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // DELETE PART
  // =========================
  describe("deletePart", () => {
    it("should delete part successfully", async () => {
      const req = { params: { partCode: "P001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(false);
      Part.findOneAndDelete.mockResolvedValue({ partCode: "P001" });

      await deletePart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part deleted successfully",
      });
    });

    it("should return 409 if issues exist", async () => {
      const req = { params: { partCode: "P001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(true);

      await deletePart(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Some Issues are raised with this part",
      });
    });

    it("should return 404 if part not found", async () => {
      const req = { params: { partCode: "P001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(false);
      Part.findOneAndDelete.mockResolvedValue(null);

      await deletePart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Part not found",
      });
    });
    it("should return 500 on error", async () => {
      const req = { body: { partName: "Bolt" } };
      const res = mockRes();

      Part.findOneAndDelete.mockRejectedValue(new Error("DB error"));

      await deletePart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
