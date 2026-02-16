import { jest } from "@jest/globals";
import { describe, it, expect, beforeEach } from "@jest/globals";
/* ===================================================
   MOCK MODULES (ESM) — must come before any imports
=================================================== */

jest.unstable_mockModule("../../Models/users.models.js", () => ({
  default: {
    find:             jest.fn(),
    findOne:          jest.fn(),
    findOneAndUpdate: jest.fn(),
    create:           jest.fn(),
  },
}));

jest.unstable_mockModule("../../Models/suppliers.models.js", () => ({
  default: {
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    info:  jest.fn(),
    error: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../Config/emailconfig.js", () => ({
  shareCredentialEmailConfig: jest.fn(),
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: jest.fn(),
  },
}));

/* ===================================================
   IMPORT MOCKED MODULES
=================================================== */

const { default: User }     = await import("../../Models/users.models.js");
const { default: Supplier } = await import("../../Models/suppliers.models.js");
const { default: logger }   = await import("../../../Config/logger.js");
const { shareCredentialEmailConfig } = await import("../../../Config/emailconfig.js");
const { default: bcrypt }   = await import("bcryptjs");

const {
  getAllUsers,
  handleSignUp,
  changeUserStatus,
  updateUser,
} = await import("../../Controllers/users.controller.js");

/* ===================================================
   HELPERS
=================================================== */

/** Chainable mock res */
const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json:   jest.fn(),
});

/**
 * Build a chainable User.find() mock:
 * User.find().select().populate().lean()
 */
const mockUserFindChain = (result) => {
  const chain = {
    select:   jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean:     jest.fn().mockResolvedValue(result),
  };
  User.find.mockReturnValue(chain);
};

/**
 * Build a chainable User.findOneAndUpdate() mock:
 * .select().populate().lean()
 */
const mockUpdateChain = (result) => {
  const chain = {
    select:   jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean:     jest.fn().mockResolvedValue(result),
  };
  User.findOneAndUpdate.mockReturnValue(chain);
};

/**
 * Build a mock Mongoose user document that supports .populate() and .toObject().
 * Used for User.create() in handleSignUp.
 */
const makeMockUserDoc = (fields = {}) => {
  const base = {
    username:  "jdoe",
    email:     "jdoe@test.com",
    firstName: "John",
    lastName:  "Doe",
    role:      "user",
    team:      { supplierName: "Production", supplierCode: "PROD", flag: "INTERNAL" },
    password:  "hashed",
    __v:       0,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id:       "user-id-001",
    ...fields,
  };

  return {
    ...base,
    // Simulate Mongoose's .populate() — mutates the doc in place, returns void
    populate: jest.fn().mockResolvedValue(undefined),
    // Simulate .toObject() — returns a plain object copy
    toObject: jest.fn(() => ({ ...base })),
  };
};

/* =====================================================
   SUITE: getAllUsers
   [A] happy path → 200
   [B] DB throws  → 500
===================================================== */
describe("getAllUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  // [A] Users fetched → 200
  it("[A] should return 200 with users list", async () => {
    const fakeUsers = [
      { username: "alice", email: "alice@test.com", role: "user" },
      { username: "bob",   email: "bob@test.com",   role: "admin" },
    ];
    mockUserFindChain(fakeUsers);

    const req = {};
    const res = mockRes();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data:    fakeUsers,
      message: "Users list fetched successfully",
    });
  });

  // [B] DB throws → 500
  it("[B] should return 500 when DB throws", async () => {
    User.find.mockImplementation(() => { throw new Error("DB crash"); });

    const req = {};
    const res = mockRes();

    await getAllUsers(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong could not fetch users",
    });
  });
});

/* =====================================================
   SUITE: handleSignUp
   [C] both username+email exist           → 409
   [D] only username exists               → 409
   [E] only email exists                  → 409
   [F] team not found                     → 404
   [G] happy path, email sent             → 201
   [H] happy path, email NOT sent         → 201
   [I] DB throws                          → 500
===================================================== */
describe("handleSignUp", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseBody = {
    username:  "jdoe",
    email:     "jdoe@test.com",
    firstName: "John",
    lastName:  "Doe",
    password:  "secret",
    role:      "user",
    team:      "PROD",
  };

  const baseReq = (overrides = {}) => ({
    body: { ...baseBody, ...overrides },
  });

  // [C] Both username and email match existing user → 409
  it("[C] should return 409 when both username and email already exist", async () => {
    User.findOne.mockResolvedValue({ username: "jdoe", email: "jdoe@test.com" });
    const res = mockRes();

    await handleSignUp(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Username and Email already exist",
    });
  });

  // [D] Only username matches → 409
  it("[D] should return 409 when only username already exists", async () => {
    User.findOne.mockResolvedValue({ username: "jdoe", email: "other@test.com" });
    const res = mockRes();

    await handleSignUp(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Username already exists",
    });
  });

  // [E] Only email matches → 409
  it("[E] should return 409 when only email already exists", async () => {
    User.findOne.mockResolvedValue({ username: "other", email: "jdoe@test.com" });
    const res = mockRes();

    await handleSignUp(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email already exists",
    });
  });

  // [F] No existing user, but team (Supplier) not found → 404
  it("[F] should return 404 when supplier team is not found", async () => {
    User.findOne.mockResolvedValue(null);
    Supplier.findOne.mockResolvedValue(null);
    const res = mockRes();

    await handleSignUp(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Supplier not found, please register supplier first",
    });
  });

  // [G] Happy path — email successfully sent → 201
  it("[G] should return 201 and confirm credentials sent when email succeeds", async () => {
    User.findOne.mockResolvedValue(null);
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1", supplierCode: "PROD" });
    bcrypt.hash.mockResolvedValue("hashed-password");

    const mockDoc = makeMockUserDoc();
    User.create.mockResolvedValue(mockDoc);
    shareCredentialEmailConfig.mockResolvedValue(true);

    const res = mockRes();
    await handleSignUp(baseReq(), res);

    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(User.create).toHaveBeenCalled();
    expect(mockDoc.populate).toHaveBeenCalled();
    expect(shareCredentialEmailConfig).toHaveBeenCalledWith("jdoe", "jdoe@test.com", "secret");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully and credentials sent",
      }),
    );
  });

  // [H] Happy path — email fails to send → 201 with alternate message
  it("[H] should return 201 with fallback message when email fails to send", async () => {
    User.findOne.mockResolvedValue(null);
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1", supplierCode: "PROD" });
    bcrypt.hash.mockResolvedValue("hashed-password");

    const mockDoc = makeMockUserDoc();
    User.create.mockResolvedValue(mockDoc);
    shareCredentialEmailConfig.mockResolvedValue(false);

    const res = mockRes();
    await handleSignUp(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully but credentials email could not be sent",
      }),
    );
  });

  // [G] edge — role not provided → role set to undefined (falsy branch)
  it("[G] should create user with undefined role when role is not provided", async () => {
    User.findOne.mockResolvedValue(null);
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1" });
    bcrypt.hash.mockResolvedValue("hashed");

    const mockDoc = makeMockUserDoc();
    User.create.mockResolvedValue(mockDoc);
    shareCredentialEmailConfig.mockResolvedValue(true);

    const res = mockRes();
    // No `role` in body
    await handleSignUp({ body: { ...baseBody, role: undefined } }, res);

    // role: role || undefined → undefined when not provided
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: undefined }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // [I] DB throws → 500
  it("[I] should return 500 on unexpected error", async () => {
    User.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await handleSignUp(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error registering user",
    });
  });
});

/* =====================================================
   SUITE: changeUserStatus
   [J] user not found      → 404
   [K] user is admin       → 403
   [L] enabled → disabled  → 200 "Disabled"
   [M] disabled → enabled  → 200 "Enabled"
   [N] DB throws           → 500
===================================================== */
describe("changeUserStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = (body = {}) => ({ body: { username: "jdoe", ...body } });

  // [J] User not found → 404
  it("[J] should return 404 when user is not found", async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();

    await changeUserStatus(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  // [K] User is admin → 403
  it("[K] should return 403 when trying to change admin status", async () => {
    User.findOne.mockResolvedValue({ username: "jdoe", role: "admin", enabled: true });
    const res = mockRes();

    await changeUserStatus(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Admin status cannot be changed",
    });
  });

  // [L] enabled: true → toggled to false → "Disabled"
  it("[L] should disable a currently enabled user and return 200", async () => {
    User.findOne.mockResolvedValue({ username: "jdoe", role: "user", enabled: true });
    User.findOneAndUpdate.mockResolvedValue({ username: "jdoe", enabled: false });
    const res = mockRes();

    await changeUserStatus(baseReq(), res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { username: "jdoe" },
      { enabled: false },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success:   true,
      newStatus: false,
      message:   "User status changed to Disabled",
    });
  });

  // [M] enabled: false → toggled to true → "Enabled"
  it("[M] should enable a currently disabled user and return 200", async () => {
    User.findOne.mockResolvedValue({ username: "jdoe", role: "user", enabled: false });
    User.findOneAndUpdate.mockResolvedValue({ username: "jdoe", enabled: true });
    const res = mockRes();

    await changeUserStatus(baseReq(), res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { username: "jdoe" },
      { enabled: true },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success:   true,
      newStatus: true,
      message:   "User status changed to Enabled",
    });
  });

  // [N] DB throws → 500
  it("[N] should return 500 on unexpected error", async () => {
    User.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await changeUserStatus(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User status could not be changed",
    });
  });
});

/* =====================================================
   SUITE: updateUser
   [O] team provided + supplier NOT found → 404
   [P] team not provided → skip lookup   (NOTE: teamExists stays undefined →
       teamExists._id inside $set would throw → covered by [U] or needs guard)
   [Q] email provided + already exists    → 409
   [R] email not provided → skip check
   [S] findOneAndUpdate returns null      → 404
   [T] happy path (team + email provided) → 200
   [U] DB throws                          → 500
===================================================== */
describe("updateUser", () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = (overrides = {}) => ({
    params: { username: "jdoe" },
    body: {
      firstName: "John",
      lastName:  "Doe",
      email:     "new@test.com",
      team:      "PROD",
      ...overrides,
    },
  });

  const fakeUpdatedUser = {
    username:  "jdoe",
    firstName: "John",
    lastName:  "Doe",
    email:     "new@test.com",
    team:      { supplierName: "Production", supplierCode: "PROD", flag: "INTERNAL" },
  };

  // [O] Team provided but supplier not found → 404
  it("[O] should return 404 when provided team supplier does not exist", async () => {
    Supplier.findOne.mockResolvedValue(null);
    const res = mockRes();

    await updateUser(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Supplier not found. Please register supplier first",
    });
  });

  // [Q] Email provided but already in use by another user → 409
  it("[Q] should return 409 when the new email is already taken by another user", async () => {
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1", supplierCode: "PROD" });
    // First User.findOne call = email conflict check
    User.findOne.mockResolvedValue({ username: "other", email: "new@test.com" });
    const res = mockRes();

    await updateUser(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  // [R] Email not provided → skip email conflict check → proceeds to update
  it("[R] should skip email uniqueness check when email is not provided", async () => {
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1", supplierCode: "PROD" });
    // User.findOne should NOT be called for email check
    mockUpdateChain(fakeUpdatedUser);
    const res = mockRes();

    await updateUser(baseReq({ email: undefined }), res);

    // User.findOne not called for the email path
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // [P] Team not provided → Supplier.findOne not called, teamExists = undefined
  // NOTE: teamExists._id inside $set will throw a TypeError — this is a real
  // bug in the controller. The test documents this behavior via the 500 path.
  it("[P] should hit 500 when team is not provided (teamExists is undefined → teamExists._id throws)", async () => {
    // No Supplier.findOne call since team is falsy
    // User.findOne for email check returns null (no conflict)
    User.findOne.mockResolvedValue(null);
    const res = mockRes();

    await updateUser(baseReq({ team: undefined }), res);

    // Controller reaches `teamExists._id` where teamExists is undefined → TypeError
    expect(Supplier.findOne).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  // [S] findOneAndUpdate returns null → 404
  it("[S] should return 404 when the user to update is not found", async () => {
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1", supplierCode: "PROD" });
    User.findOne.mockResolvedValue(null); // no email conflict
    mockUpdateChain(null);
    const res = mockRes();

    await updateUser(baseReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // [T] Happy path — team + email both provided, update succeeds → 200
  it("[T] should update user and return 200 on success", async () => {
    Supplier.findOne.mockResolvedValue({ _id: "supplier-id-1", supplierCode: "PROD" });
    User.findOne.mockResolvedValue(null); // no email conflict
    mockUpdateChain(fakeUpdatedUser);
    const res = mockRes();

    await updateUser(baseReq(), res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { username: "jdoe" },
      expect.objectContaining({
        $set: expect.objectContaining({
          firstName: "John",
          lastName:  "Doe",
          email:     "new@test.com",
          team:      "supplier-id-1",
        }),
      }),
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated successfully",
      data:    fakeUpdatedUser,
    });
  });

  // [U] DB throws → 500
  it("[U] should return 500 on unexpected error", async () => {
    Supplier.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();

    await updateUser(baseReq(), res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});