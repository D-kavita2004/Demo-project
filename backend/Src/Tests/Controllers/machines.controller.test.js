import { jest } from "@jest/globals";

/* =========================
   MOCK MODULES (ESM)
========================= */
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

/* =========================
   IMPORT AFTER MOCKS
========================= */
const {
  createMachine,
  getMachines,
  updateMachine,
  deleteMachine,
} = await import("../../Controllers/machines.controller.js");

const Machine = (await import("../../Models/machines.models.js")).default;
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

describe("createMachine", () => {
  it("should return 409 if machine already exists", async () => {
    Machine.findOne.mockResolvedValue({ machineName: "lathe" });

    const req = { body: { machineName: "Lathe" } };
    const res = mockResponse();

    await createMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine already exists",
    });
  });

  it("should create a new machine", async () => {
    Machine.findOne.mockResolvedValue(null);
    Machine.create.mockResolvedValue({
      machineCode: "M001",
      machineName: "lathe",
    });

    const req = { body: { machineName: "Lathe" } };
    const res = mockResponse();

    await createMachine(req, res);

    expect(Machine.create).toHaveBeenCalledWith({ machineName: "lathe" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine created successfully",
      machine: { machineCode: "M001", machineName: "lathe" },
    });
  });
});

describe("getMachines", () => {
  it("should return all machines", async () => {
    const mockMachines = [{ machineCode: "M001", machineName: "lathe" }];

    Machine.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockMachines),
    });

    const res = mockResponse();
    await getMachines({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All Machines fetched Successfully",
      machines: mockMachines,
    });
  });
});

describe("updateMachine", () => {
  it("should return 409 if duplicate machine name exists", async () => {
    Machine.findOne.mockResolvedValue({ machineName: "lathe" });

    const req = {
      body: { machineName: "Lathe" },
      params: { machineCode: "M001" },
    };
    const res = mockResponse();

    await updateMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine name already exists",
    });
  });

  it("should return 404 if machine not found", async () => {
    Machine.findOne.mockResolvedValue(null);
    Machine.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      body: { machineName: "Lathe" },
      params: { machineCode: "M001" },
    };
    const res = mockResponse();

    await updateMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine not found",
    });
  });

  it("should update the machine successfully", async () => {
    Machine.findOne.mockResolvedValue(null);
    Machine.findOneAndUpdate.mockResolvedValue({
      machineCode: "M001",
      machineName: "lathe",
    });

    const req = {
      body: { machineName: "Lathe" },
      params: { machineCode: "M001" },
    };
    const res = mockResponse();

    await updateMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine updated successfully",
      machine: { machineCode: "M001", machineName: "lathe" },
    });
  });
});

describe("deleteMachine", () => {
  it("should return 409 if issues exist for the machine", async () => {
    Form.exists.mockResolvedValue(true);

    const req = { params: { machineCode: "M001" } };
    const res = mockResponse();

    await deleteMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some Issues are raised with this machine",
    });
  });

  it("should return 404 if machine not found", async () => {
    Form.exists.mockResolvedValue(false);
    Machine.findOneAndDelete.mockResolvedValue(null);

    const req = { params: { machineCode: "M001" } };
    const res = mockResponse();

    await deleteMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine not found",
    });
  });

  it("should delete machine successfully", async () => {
    Form.exists.mockResolvedValue(false);
    Machine.findOneAndDelete.mockResolvedValue({ machineCode: "M001" });

    const req = { params: { machineCode: "M001" } };
    const res = mockResponse();

    await deleteMachine(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Machine deleted successfully",
    });
  });
});
