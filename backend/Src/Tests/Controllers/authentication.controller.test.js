import { jest } from "@jest/globals";

/* ===================== MOCKS (MUST BE FIRST) ===================== */

jest.unstable_mockModule("../../../Src/Models/users.models.js", () => ({
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    error: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/emailconfig.js", () => ({
  forgetPasswordEmailConfig: jest.fn(),
}));

/* ===================== IMPORTS (AFTER MOCKS) ===================== */

const {
  handleLogin,
  handleLogout,
  forgotPassword,
  resetPassword,
} = await import("../../../Src/Controllers/authentication.controller.js");

const User =
  (await import("../../../Src/Models/users.models.js")).default;

const bcrypt =
  (await import("bcryptjs")).default;

const jwt =
  (await import("jsonwebtoken")).default;

const { forgetPasswordEmailConfig } =
  await import("../../../Config/emailconfig.js");

/* ===================== COMMON MOCK HELPERS ===================== */

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

const mockNext = jest.fn();

/* ===================== TESTS ===================== */

describe("handleLogin", () => {
  it("should return 404 if user not found", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    const res = mockResponse();
    await handleLogin(
      { body: { username: "test", password: "123" } },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 403 if user is disabled", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ enabled: false }),
    });

    const res = mockResponse();
    await handleLogin(
      { body: { username: "test", password: "123" } },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "User is disabled" });
  });

  it("should return 401 for invalid password", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        enabled: true,
        password: "hashed",
      }),
    });

    bcrypt.compare.mockResolvedValue(false);

    const res = mockResponse();
    await handleLogin(
      { body: { username: "test", password: "wrong" } },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid Password" });
  });

  it("should login successfully", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        enabled: true,
        password: "hashed",
        role: "admin",
      }),
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-token");

    const res = mockResponse();
    await handleLogin(
      { body: { username: "test", password: "123" } },
      res,
    );

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("handleLogout", () => {
  it("should logout successfully", () => {
    const res = mockResponse();
    handleLogout({}, res);

    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
  });
});

describe("forgotPassword", () => {
  it("should return 404 if user not found", async () => {
    User.findOne.mockResolvedValue(null);

    const res = mockResponse();
    await forgotPassword(
      { body: { email: "a@a.com" } },
      res,
      mockNext,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should send reset email", async () => {
    User.findOne.mockResolvedValue({ _id: "123" });
    jwt.sign.mockReturnValue("reset-token");
    forgetPasswordEmailConfig.mockResolvedValue(true);

    const res = mockResponse();
    await forgotPassword(
      { body: { email: "a@a.com" } },
      res,
      mockNext,
    );

    expect(forgetPasswordEmailConfig).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("resetPassword", () => {
  it("should reject invalid token", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const res = mockResponse();
    await resetPassword(
      { params: { token: "bad" }, body: { updatedPassword: "123" } },
      res,
      mockNext,
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should update password successfully", async () => {
    jwt.verify.mockReturnValue({ userId: "123" });

    const saveMock = jest.fn();
    User.findById.mockResolvedValue({
      password: "old",
      save: saveMock,
    });

    bcrypt.hash.mockResolvedValue("hashed-new");

    const res = mockResponse();
    await resetPassword(
      { params: { token: "good" }, body: { updatedPassword: "123" } },
      res,
      mockNext,
    );

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
