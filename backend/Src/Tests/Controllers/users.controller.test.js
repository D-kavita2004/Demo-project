import { jest } from "@jest/globals";

/* =========================
   MOCK MODULES
========================= */
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/users.models.js", () => ({
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    exists: jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/suppliers.models.js", () => ({
  default: {
    findOne: jest.fn(),
    exists: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/emailconfig.js", () => ({
  shareCredentialEmailConfig: jest.fn(),
}));



/* =========================
   IMPORT MOCKED MODULES
========================= */

const { default: User } = await import("../../Models/users.models.js");
const { default: Supplier } = await import("../../Models/suppliers.models.js");
const logger = (await import("../../../Config/logger.js")).default;
const { shareCredentialEmailConfig } = await import("../../../Config/emailconfig.js");
const bcrypt =
  (await import("bcryptjs")).default;

const {
  getAllUsers,
  handleSignUp,
  changeUserStatus,
  updateUser,
} = await import("../../Controllers/users.controller.js");

/* =========================
   HELPER: MOCK RESPONSE
========================= */
const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

/* =========================
   TEST: getAllUsers
========================= */
describe("getAllUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return list of users", async () => {
    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ username: "testuser" }]),
        }),
      }),
    });

    const res = mockRes();
    await getAllUsers({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ username: "testuser" }],
      message: "Users list fetched successfully",
    });
  });

  it("should return 500 on error", async () => {
    User.find.mockImplementation(() => { throw new Error("DB error"); });

    const res = mockRes();
    await getAllUsers({}, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong could not fetch users",
    });
  });
});

/* =========================
   TEST: handleSignUp
========================= */
describe("handleSignUp", () => {
  beforeEach(() => jest.clearAllMocks());

  const reqBody = {
    username: "newuser",
    email: "newuser@test.com",
    firstName: "First",
    lastName: "Last",
    password: "pass123",
    role: "user",
    team: "SUP001",
  };

  it("should return 409 if user exists", async () => {
    User.findOne.mockResolvedValue({ username: "newuser", email: "newuser@test.com" });

    const res = mockRes();
    await handleSignUp({ body: reqBody }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Username and Email already exist",
    });
  });

  it("should return 404 if team does not exist", async () => {
    User.findOne.mockResolvedValue(null);
    Supplier.findOne.mockResolvedValue(null);

    const res = mockRes();
    await handleSignUp({ body: reqBody }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Supplier not found, please register supplier first",
    });
  });

  it("should create user successfully and send email", async () => {
    User.findOne.mockResolvedValue(null);
    Supplier.findOne.mockResolvedValue({
      _id: "teamId",
      supplierName: "Supplier ABC",
      supplierCode: "SUP001",
    });
    bcrypt.hash.mockResolvedValue("hashedPass");

    const mockUserDoc = {
      username: "newuser",
      email: "newuser@test.com",
      firstName: "First",
      lastName: "Last",
      role: "user",
      team: { supplierName: "Supplier ABC", supplierCode: "SUP001" },
      toObject: function () {
        return {
          username: this.username,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          role: this.role,
          team: this.team,
        };
      },
      populate: jest.fn().mockResolvedValue(this), 
    };

    User.create.mockResolvedValue(mockUserDoc);
    shareCredentialEmailConfig.mockResolvedValue(true);

    const res = mockRes();
    await handleSignUp({ body: reqBody }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully and credentials sent",
        data: {
          username: "newuser",
          email: "newuser@test.com",
          firstName: "First",
          lastName: "Last",
          role: "user",
          team: { supplierName: "Supplier ABC", supplierCode: "SUP001" },
        },
      }),
    );
  });


  it("should handle signup error", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await handleSignUp({ body: reqBody }, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error registering user",
    });
  });
});

/* =========================
   TEST: changeUserStatus
========================= */
describe("changeUserStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return 404 if user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await changeUserStatus({ body: { username: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
  });

  it("should return 403 if user is admin", async () => {
    User.findOne.mockResolvedValue({ role: "admin" });
    const res = mockRes();
    await changeUserStatus({ body: { username: "admin" } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Admin status cannot be changed" });
  });

  it("should toggle user status successfully", async () => {
    User.findOne.mockResolvedValue({ username: "abc", enabled: false, role: "user" });
    User.findOneAndUpdate.mockResolvedValue({ username: "abc", enabled: true });

    const res = mockRes();
    await changeUserStatus({ body: { username: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      newStatus: true,
      message: "User status changed to Enabled",
    });
  });

  it("should return 500 on error", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await changeUserStatus({ body: { username: "abc" } }, res);
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User status could not be changed" });
  });
});

/* =========================
   TEST: updateUser
========================= */
describe("updateUser", () => {
  beforeEach(() => jest.clearAllMocks());

  const req = {
    params: { username: "abc" },
    body: { firstName: "New", lastName: "Name", email: "new@test.com", team: "SUP001" },
  };

  it("should return 404 if team does not exist", async () => {
    Supplier.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Supplier not found. Please register supplier first" });
  });

  it("should return 409 if email exists", async () => {
    Supplier.findOne.mockResolvedValue({ _id: "teamId" });
    User.findOne.mockResolvedValue({ email: "new@test.com" });
    const res = mockRes();
    await updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  it("should update user successfully", async () => {
    Supplier.findOne.mockResolvedValue({ _id: "teamId" });
    User.findOne.mockResolvedValue(null);
    User.findOneAndUpdate.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ username: "abc", firstName: "New" }),
        }),
      }),
    });

    const res = mockRes();
    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated successfully",
      data: { username: "abc", firstName: "New" },
    });
  });

  it("should handle server error", async () => {
    Supplier.findOne.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await updateUser(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
