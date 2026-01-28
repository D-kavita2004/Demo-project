import { jest } from "@jest/globals";
import { de } from "zod/locales";

// ============================
// MOCK MODULES
// ============================

jest.unstable_mockModule("../../Models/machines.models.js", () => ({
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

const { default: Machine } = await import("../../Models/machines.models.js");
const { default: Form } = await import("../../Models/form.models.js");

const {
  createMachine,
  getMachines,
  updateMachine,
  deleteMachine,
} = await import("../../Controllers/machines.controller.js");

// ============================
// COMMON MOCK RESPONSE
// ============================

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe("Machines Controller (ESM + unstable_mockModule)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE MACHINE
  // =========================
  describe("createMachine", () => {
    it("should create machine successfully", async () => {
      const req = { body: { machineName: "Lathe" } };
      const res = mockRes();

      Machine.findOne.mockResolvedValue(null);
      Machine.create.mockResolvedValue({
        machineCode: "M001",
        machineName: "lathe",
      });

      await createMachine(req, res);

      expect(Machine.findOne).toHaveBeenCalledWith({ machineName: "lathe" });
      expect(Machine.create).toHaveBeenCalledWith({ machineName: "lathe" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine created successfully",
        machine: { machineCode: "M001", machineName: "lathe" },
      });
    });

    it("should return 409 if machine already exists", async () => {
      const req = { body: { machineName: "Lathe" } };
      const res = mockRes();

      Machine.findOne.mockResolvedValue({ machineName: "lathe" });

      await createMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine already exists",
      });
    });

    it("should return 500 on error", async () => {
      const req = { body: { machineName: "Lathe" } };
      const res = mockRes();

      Machine.findOne.mockRejectedValue(new Error("DB error"));

      await createMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // GET MACHINES
  // =========================
  describe("getMachines", () => {
    it("should fetch all machines", async () => {
      const req = {};
      const res = mockRes();

      const machines = [{ machineCode: "M001", machineName: "lathe" }];

      Machine.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(machines),
      });

      await getMachines(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All Machines fetched Successfully",
        machines,
      });
    });

    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Machine.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getMachines(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // UPDATE MACHINE
  // =========================
  describe("updateMachine", () => {
    it("should update machine successfully", async () => {
      const req = {
        body: { machineName: "Drill" },
        params: { machineCode: "M001" },
      };
      const res = mockRes();

      Machine.findOne.mockResolvedValue(null);
      Machine.findOneAndUpdate.mockResolvedValue({
        machineCode: "M001",
        machineName: "drill",
      });

      await updateMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine updated successfully",
        machine: { machineCode: "M001", machineName: "drill" },
      });
    });

    it("should return 409 if duplicate machine name exists", async () => {
      const req = {
        body: { machineName: "Drill" },
        params: { machineCode: "M001" },
      };
      const res = mockRes();

      Machine.findOne.mockResolvedValue({ machineName: "drill" });

      await updateMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine name already exists",
      });
    });

    it("should return 404 if machine not found", async () => {
      const req = {
        body: { machineName: "Drill" },
        params: { machineCode: "M001" },
      };
      const res = mockRes();

      Machine.findOne.mockResolvedValue(null);
      Machine.findOneAndUpdate.mockResolvedValue(null);

      await updateMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine not found",
      });
    });
    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Machine.findOneAndUpdate.mockImplementation(() => {
        throw new Error("DB error");
      });

      await updateMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  // =========================
  // DELETE MACHINE
  // =========================
  describe("deleteMachine", () => {
    it("should delete machine successfully", async () => {
      const req = { params: { machineCode: "M001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(false);
      Machine.findOneAndDelete.mockResolvedValue({ machineCode: "M001" });

      await deleteMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine deleted successfully",
      });
    });

    it("should return 409 if issues exist for machine", async () => {
      const req = { params: { machineCode: "M001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(true);

      await deleteMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Some Issues are raised with this machine",
      });
    });

    it("should return 404 if machine not found", async () => {
      const req = { params: { machineCode: "M001" } };
      const res = mockRes();

      Form.exists.mockResolvedValue(false);
      Machine.findOneAndDelete.mockResolvedValue(null);

      await deleteMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Machine not found",
      });
    });
    it("should return 500 on error", async () => {
      const req = {};
      const res = mockRes();

      Machine.findOneAndDelete.mockImplementation(() => {
        throw new Error("DB error");
      });

      await deleteMachine(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
