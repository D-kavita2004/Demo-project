import { jest } from "@jest/globals";

// ============================
// MOCK MODULES
// ============================

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    error: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/users.models.js", () => ({
  default: {
    findOne: jest.fn(),
  },
}));

// ============================
// IMPORT MOCKED MODULES
// ============================

const jwt = (await import("jsonwebtoken")).default;
const logger = (await import("../../../Config/logger.js")).default;
const User = (await import("../../Models/users.models.js")).default;
const verifyToken = (await import("../../Middlewares/verifyToken.middleware.js")).default;

// ============================
// HELPERS
// ============================

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe("verifyToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = mockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 401 if token is not provided", async () => {
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. No token provided.",
    });
  });

  it("should return 302 if jwt verification fails", async () => {
    req.cookies.token = "invalid-token";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await verifyToken(req, res, next);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(302);
    expect(res.json).toHaveBeenCalledWith({
      message: "Session expired. Please login again !",
    });
  });

  it("should return 302 if user is not found", async () => {
    req.cookies.token = "valid-token";

    jwt.verify.mockReturnValue({
      username: "kavita",
      role: "ADMIN",
      team: { supplierCode: "SUP01" },
    });

    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await verifyToken(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it("should return 302 if user is disabled", async () => {
    req.cookies.token = "valid-token";

    jwt.verify.mockReturnValue({
      username: "kavita",
      role: "ADMIN",
      team: { supplierCode: "SUP01" },
    });

    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        enabled: false,
      }),
    });

    await verifyToken(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "User is disabled.",
    });
  });

  it("should return 302 if user role has changed", async () => {
    req.cookies.token = "valid-token";

    jwt.verify.mockReturnValue({
      username: "kavita",
      role: "ADMIN",
      team: { supplierCode: "SUP01" },
    });

    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        enabled: true,
        role: "USER",
        team: { supplierCode: "SUP01" },
      }),
    });

    await verifyToken(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "User role has been changed. Please Login Again",
    });
  });

  it("should return 302 if user's team has changed", async () => {
    req.cookies.token = "valid-token";

    jwt.verify.mockReturnValue({
      username: "kavita",
      role: "ADMIN",
      team: { supplierCode: "SUP01" },
    });

    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        enabled: true,
        role: "ADMIN",
        team: { supplierCode: "SUP02" },
      }),
    });

    await verifyToken(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "Your Team has been changed. Please Login Again",
    });
  });

  it("should attach user to req and call next if token is valid", async () => {
    req.cookies.token = "valid-token";

    const decodedUser = {
      username: "kavita",
      role: "ADMIN",
      team: { supplierCode: "SUP01" },
    };

    jwt.verify.mockReturnValue(decodedUser);

    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        enabled: true,
        role: "ADMIN",
        team: { supplierCode: "SUP01" },
      }),
    });

    await verifyToken(req, res, next);

    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });
});
