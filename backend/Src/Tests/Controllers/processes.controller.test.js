import { jest } from "@jest/globals";

// ============================
// MOCK MODULES
// ============================

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

// ============================
// IMPORT AFTER MOCKING
// ============================

const { default: Process } = await import("../../Models/processes.models.js");
const { default: Form } = await import("../../Models/form.models.js");

const {
  createProcess,
  getProcesses,
  updateProcess,
  deleteProcess,
} = await import("../../Controllers/processes.controller.js");

// ============================
// COMMON MOCK RESPONSE
// ============================

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe("Processes Controller (ESM + unstable_mockModule)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE PROCESS
  // =========================
  describe("createProcess", () => {
    it("should create process successfully", async () => {
      const req = { body: { processName: "Cutting" } };
      const res = mockRes();

      Process.findOne.mockResolvedValue(null);
      Process.create.mockResolvedValue({
        processCode: "PR001",
        processName: "cutting",
      });

      await createProcess(req, res);

      expect(Process.findOne).toHaveBeenCalledWith({ processName: "cutting" });
      expect(Process.create).toHaveBeenCalledWith({ processName: "cutting" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process created successfully",
        process: { processCode: "PR001", processName: "cutting" },
      });
    });

    it("should return 409 if process already exists", async () => {
      const req = { body: { processName: "Cutting" } };
      const res = mockRes();

      Process.findOne.mockResolvedValue({ processName: "cutting" });

      await createProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process already exists",
      });
    });

    it("should return 500 on error", async () => {
      const req = { body: { processName: "Cutting" } };
      const res = mockRes();

      Process.findOne.mockRejectedValue(new Error("DB error"));

      await createProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // GET PROCESSES
  // =========================
  describe("getProcesses", () => {
    it("should fetch all processes", async () => {
      const req = {};
      const res = mockRes();

      const processes = [
        { processCode: "PR001", processName: "cutting" },
      ];

      Process.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(processes),
      });

      await getProcesses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All Processs fetched Successfully",
        processes,
      });
    });

    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Process.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getProcesses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // UPDATE PROCESS
  // =========================
  describe("updateProcess", () => {
    it("should update process successfully", async () => {
      const req = {
        body: { processName: "Welding" },
        params: { processCode: "PR001" },
      };
      const res = mockRes();

      Process.findOne.mockResolvedValue(null);
      Process.findOneAndUpdate.mockResolvedValue({
        processCode: "PR001",
        processName: "welding",
      });

      await updateProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process updated successfully",
        process: { processCode: "PR001", processName: "welding" },
      });
    });

    it("should return 409 if duplicate process name exists", async () => {
      const req = {
        body: { processName: "Welding" },
        params: { processCode: "PR001" },
      };
      const res = mockRes();

      Process.findOne.mockResolvedValue({ processName: "welding" });

      await updateProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process name already exists",
      });
    });

    it("should return 404 if process not found", async () => {
      const req = {
        body: { processName: "Welding" },
        params: { processCode: "PR001" },
      };
      const res = mockRes();

      Process.findOne.mockResolvedValue(null);
      Process.findOneAndUpdate.mockResolvedValue(null);

      await updateProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process not found",
      });
    });

    it("should return 500 on update error", async () => {
      const req = {
        body: { processName: "Welding" },
        params: { processCode: "PR001" },
      };
      const res = mockRes();

      Process.findOne.mockRejectedValue(new Error("DB error"));

      await updateProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // DELETE PROCESS
  // =========================
  describe("deleteProcess", () => {
    it("should delete process successfully", async () => {
      const req = { params: { processCode: "PR001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(false);
      Process.findOneAndDelete.mockResolvedValue({ processCode: "PR001" });

      await deleteProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process deleted successfully",
      });
    });

    it("should return 409 if issues exist for process", async () => {
      const req = { params: { processCode: "PR001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(true);

      await deleteProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Some Issues are raised with this process",
      });
    });

    it("should return 404 if process not found", async () => {
      const req = { params: { processCode: "PR001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(false);
      Process.findOneAndDelete.mockResolvedValue(null);

      await deleteProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Process not found",
      });
    });

    it("should return 500 on delete error", async () => {
      const req = { params: { processCode: "PR001" } };
      const res = mockRes();

      Form.exists.mockRejectedValue(new Error("DB error"));

      await deleteProcess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
