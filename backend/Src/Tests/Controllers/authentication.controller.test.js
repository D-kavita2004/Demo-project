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
    await handleLogin({ body: { username: "test", password: "123" } }, res);

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
    await handleLogin({ body: { username: "test", password: "123" } }, res);

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
    await handleLogin({ body: { username: "test", password: "wrong" } }, res);

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
    await handleLogin({ body: { username: "test", password: "123" } }, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith("token", "fake-token", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Login successful", user: expect.any(Object) })
    );
  });

  it("should handle unexpected errors", async () => {
    const error = new Error("DB failed");
    User.findOne.mockImplementation(() => { throw error; });

    const res = mockResponse();
    await handleLogin({ body: { username: "test", password: "123" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Login failed" });
  });
});


describe("handleLogout", () => {
  it("should clear the token cookie and return 200", () => {
    const res = mockResponse();
    handleLogout({}, res);

    expect(res.clearCookie).toHaveBeenCalledWith("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      expires: new Date(0),
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
  });

  it("should handle errors and return 500", () => {
    const res = mockResponse();
    // Force clearCookie to throw an error
    res.clearCookie.mockImplementation(() => {
      throw new Error("Cookie failed");
    });

    handleLogout({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout failed" });
  });
});


describe("forgotPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user not found", async () => {
    User.findOne.mockResolvedValue(null);

    const res = mockResponse();
    await forgotPassword({ body: { email: "test@example.com" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot find user with this email",
    });
  });

  it("should return 200 if reset link sent successfully", async () => {
    const userData = { _id: "123" };
    User.findOne.mockResolvedValue(userData);
    jwt.sign.mockReturnValue("reset-token");
    forgetPasswordEmailConfig.mockResolvedValue(true);

    const res = mockResponse();
    await forgotPassword({ body: { email: "test@example.com" } }, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: "123" },
      process.env.RESET_PASSWORD_TOKEN,
      { expiresIn: process.env.RESET_LINK_EXPIRY }
    );

    expect(forgetPasswordEmailConfig).toHaveBeenCalledWith("test@example.com", "reset-token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Reset Link Sent",
    });
  });

  it("should return 500 if email sending fails", async () => {
    const userData = { _id: "123" };
    User.findOne.mockResolvedValue(userData);
    jwt.sign.mockReturnValue("reset-token");
    forgetPasswordEmailConfig.mockResolvedValue(false);

    const res = mockResponse();
    await forgotPassword({ body: { email: "test@example.com" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Could not send email",
    });
  });

  it("should handle unexpected errors", async () => {
    User.findOne.mockRejectedValue(new Error("DB Error"));

    const res = mockResponse();
    await forgotPassword({ body: { email: "test@example.com" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});


describe("resetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if token or updatedPassword is missing", async () => {
    const res = mockResponse();
    await resetPassword({ params: {}, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token and new password are required",
    });
  });

  it("should return 401 if JWT verification fails", async () => {
    jwt.verify.mockImplementation(() => { throw new Error("Invalid token"); });

    const res = mockResponse();
    await resetPassword({ params: { token: "fake-token" }, body: { updatedPassword: "123" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Reset link has expired or is invalid",
    });
  });

  it("should return 404 if user not found", async () => {
    jwt.verify.mockReturnValue({ userId: "123" });
    User.findById.mockResolvedValue(null);

    const res = mockResponse();
    await resetPassword({ params: { token: "fake-token" }, body: { updatedPassword: "123" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should update password successfully", async () => {
    jwt.verify.mockReturnValue({ userId: "123" });
    const user = { save: jest.fn() };
    User.findById.mockResolvedValue(user);
    bcrypt.hash.mockResolvedValue("hashedPassword");

    const res = mockResponse();
    await resetPassword({ params: { token: "fake-token" }, body: { updatedPassword: "123" } }, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("123", 10);
    expect(user.password).toBe("hashedPassword");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password updated successfully",
    });
  });

  it("should handle unexpected errors", async () => {
    User.findById.mockRejectedValue(new Error("DB Error"));

    const res = mockResponse();
    await resetPassword({ params: { token: "fake-token" }, body: { updatedPassword: "123" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
