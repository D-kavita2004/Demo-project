import { jest } from "@jest/globals";

/* =========================
   MOCK MODULES (ESM)
========================= */
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

/* =========================
   IMPORT AFTER MOCKS
========================= */
const {
  createPart,
  getParts,
  updatePart,
  deletePart,
} = await import("../../Controllers/parts.controller.js");

const Part = (await import("../../Models/parts.models.js")).default;
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

describe("createPart", () => {
  it("should return 409 if part already exists", async () => {
    Part.findOne.mockResolvedValue({ partName: "engine" });

    const req = { body: { partName: "Engine" } };
    const res = mockResponse();

    await createPart(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part already exists",
    });
  });

  it("should create a new part", async () => {
    Part.findOne.mockResolvedValue(null);
    Part.create.mockResolvedValue({
      partCode: "P001",
      partName: "engine",
    });

    const req = { body: { partName: "Engine" } };
    const res = mockResponse();

    await createPart(req, res);

    expect(Part.create).toHaveBeenCalledWith({ partName: "engine" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part created successfully",
      part: { partCode: "P001", partName: "engine" },
    });
  });
});

describe("getParts", () => {
  it("should return all parts", async () => {
    const mockParts = [{ partCode: "P001", partName: "engine" }];

    Part.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockParts),
    });

    const res = mockResponse();
    await getParts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All Parts fetched Successfully",
      parts: mockParts,
    });
  });
});

describe("updatePart", () => {
  it("should return 409 if duplicate part name exists", async () => {
    Part.findOne.mockResolvedValue({ partName: "engine" });

    const req = {
      body: { partName: "Engine" },
      params: { partCode: "P001" },
    };
    const res = mockResponse();

    await updatePart(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part name already exists",
    });
  });

  it("should return 404 if part not found", async () => {
    Part.findOne.mockResolvedValue(null);
    Part.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      body: { partName: "Engine" },
      params: { partCode: "P001" },
    };
    const res = mockResponse();

    await updatePart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part not found",
    });
  });

  it("should update the part successfully", async () => {
    Part.findOne.mockResolvedValue(null);
    Part.findOneAndUpdate.mockResolvedValue({
      partCode: "P001",
      partName: "engine",
    });

    const req = {
      body: { partName: "Engine" },
      params: { partCode: "P001" },
    };
    const res = mockResponse();

    await updatePart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part updated successfully",
      part: {
        partCode: "P001",
        partName: "engine",
      },
    });
  });
});

describe("deletePart", () => {
  it("should return 409 if issues exist for the part", async () => {
    Form.exists.mockResolvedValue(true);

    const req = { params: { partCode: "P001" } };
    const res = mockResponse();

    await deletePart(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some Issues are raised with this part",
    });
  });

  it("should return 404 if part not found", async () => {
    Form.exists.mockResolvedValue(false);
    Part.findOneAndDelete.mockResolvedValue(null);

    const req = { params: { partCode: "P001" } };
    const res = mockResponse();

    await deletePart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part not found",
    });
  });

  it("should delete part successfully", async () => {
    Form.exists.mockResolvedValue(false);
    Part.findOneAndDelete.mockResolvedValue({ partCode: "P001" });

    const req = { params: { partCode: "P001" } };
    const res = mockResponse();

    await deletePart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Part deleted successfully",
    });
  });
});
