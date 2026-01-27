import { jest } from "@jest/globals";

/* =========================
   MOCK MODULES (ESM)
========================= */
jest.unstable_mockModule("../../Models/processes.models.js", () => ({
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
  createProcess,
  getProcesses,
  updateProcess,
  deleteProcess,
} = await import("../../Controllers/processes.controller.js");

const Process = (await import("../../Models/processes.models.js")).default;
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

describe("createProcess", () => {
  it("should return 409 if process already exists", async () => {
    Process.findOne.mockResolvedValue({ processName: "assembly" });

    const req = { body: { processName: "Assembly" } };
    const res = mockResponse();

    await createProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process already exists",
    });
  });

  it("should create a new process", async () => {
    Process.findOne.mockResolvedValue(null);
    Process.create.mockResolvedValue({
      processCode: "P001",
      processName: "assembly",
    });

    const req = { body: { processName: "Assembly" } };
    const res = mockResponse();

    await createProcess(req, res);

    expect(Process.create).toHaveBeenCalledWith({ processName: "assembly" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process created successfully",
      process: { processCode: "P001", processName: "assembly" },
    });
  });
});

describe("getProcesses", () => {
  it("should return all processes", async () => {
    const mockProcesses = [{ processCode: "P001", processName: "assembly" }];

    Process.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockProcesses),
    });

    const res = mockResponse();
    await getProcesses({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All Processs fetched Successfully",
      processes: mockProcesses,
    });
  });
});

describe("updateProcess", () => {
  it("should return 409 if duplicate process name exists", async () => {
    Process.findOne.mockResolvedValue({ processName: "assembly" });

    const req = {
      body: { processName: "Assembly" },
      params: { processCode: "P001" },
    };
    const res = mockResponse();

    await updateProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process name already exists",
    });
  });

  it("should return 404 if process not found", async () => {
    Process.findOne.mockResolvedValue(null);
    Process.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      body: { processName: "Assembly" },
      params: { processCode: "P001" },
    };
    const res = mockResponse();

    await updateProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process not found",
    });
  });

  it("should update the process successfully", async () => {
    Process.findOne.mockResolvedValue(null);
    Process.findOneAndUpdate.mockResolvedValue({
      processCode: "P001",
      processName: "assembly",
    });

    const req = {
      body: { processName: "Assembly" },
      params: { processCode: "P001" },
    };
    const res = mockResponse();

    await updateProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process updated successfully",
      process: { processCode: "P001", processName: "assembly" },
    });
  });
});

describe("deleteProcess", () => {
  it("should return 409 if issues exist for the process", async () => {
    Form.exists.mockResolvedValue(true);

    const req = { params: { processCode: "P001" } };
    const res = mockResponse();

    await deleteProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some Issues are raised with this process",
    });
  });

  it("should return 404 if process not found", async () => {
    Form.exists.mockResolvedValue(false);
    Process.findOneAndDelete.mockResolvedValue(null);

    const req = { params: { processCode: "P001" } };
    const res = mockResponse();

    await deleteProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process not found",
    });
  });

  it("should delete process successfully", async () => {
    Form.exists.mockResolvedValue(false);
    Process.findOneAndDelete.mockResolvedValue({ processCode: "P001" });

    const req = { params: { processCode: "P001" } };
    const res = mockResponse();

    await deleteProcess(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Process deleted successfully",
    });
  });
});
