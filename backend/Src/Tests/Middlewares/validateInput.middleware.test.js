import { jest } from "@jest/globals";
import { ZodError } from "zod";
import { describe, it, expect, beforeEach } from "@jest/globals";

/* ===================================================
   MOCK MODULES (ESM) — must come before any imports
=================================================== */

jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    error: jest.fn(),
    info:  jest.fn(),
  },
}));

/* ===================================================
   IMPORT MODULE UNDER TEST
=================================================== */

const { validateInput, validateFormFieldsInput } =
  await import("../../Middlewares/validateInput.middleware.js");

/* ===================================================
   HELPERS
=================================================== */

/** Chainable mock res */
const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json:   jest.fn(),
});

/**
 * Build a real ZodError instance from a plain issues array.
 *
 * ZodError's constructor accepts ZodIssue[]. Each issue must have at
 * minimum: { code, path, message }.  We use "custom" as the code so
 * Zod doesn't try to enrich the message further.
 *
 * Using a real ZodError (not a duck-typed object) ensures that
 * `err instanceof ZodError` is true inside the middleware — which is
 * exactly the branch condition being tested.
 */
const makeZodError = (issues) =>
  new ZodError(
    issues.map(({ path, message }) => ({
      code:    "custom",
      path,
      message,
    })),
  );

/**
 * Build a fake schema whose .parse() throws or succeeds on demand.
 * Used for validateInput tests.
 */
const makeParseSchema = ({ throws = null, returns = null } = {}) => ({
  parse: jest.fn(() => {
    if (throws) throw throws;
    return returns;
  }),
});

/**
 * Build a fake schema whose .safeParse() returns a controlled result.
 * Used for validateFormFieldsInput tests.
 */
const makeSafeParseSchema = (result) => ({
  safeParse: jest.fn(() => result),
});

/* =====================================================
   SUITE: validateInput(schema)
   [A] parse succeeds            → req.body = parsed, next()
   [B] parse throws ZodError     → 400 {success, errors}
       [B1] single issue         → one key mapped
       [B2] multiple issues      → all keys mapped
   [C] parse throws generic Error→ 500 {success, message}
===================================================== */
describe("validateInput()", () => {
  beforeEach(() => jest.clearAllMocks());

  // [A] Happy path — schema.parse succeeds
  it("[A] should assign parsed body to req.body and call next() on success", () => {
    const parsedData  = { username: "alice", email: "alice@test.com" };
    const schema      = makeParseSchema({ returns: parsedData });
    // Capture the original body BEFORE the middleware mutates req.body = parsed
    const originalBody = { username: "alice", email: "alice@test.com", extra: "strip-me" };
    const req          = { body: { ...originalBody } };
    const res          = mockRes();
    const next         = jest.fn();

    validateInput(schema)(req, res, next);

    // schema.parse was called with the ORIGINAL body (before mutation)
    expect(schema.parse).toHaveBeenCalledWith(originalBody);
    // req.body is now the parsed/stripped result (extra field gone)
    expect(req.body).toBe(parsedData);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  // [B1] ZodError with a single issue — key taken from path[0]
  it("[B1] should return 400 with a single field error when ZodError has one issue", () => {
    const zodErr = makeZodError([{ path: ["email"], message: "Invalid email" }]);
    const schema = makeParseSchema({ throws: zodErr });
    const req    = { body: { email: "bad" } };
    const res    = mockRes();
    const next   = jest.fn();

    validateInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors:  { email: "Invalid email" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [B2] ZodError with multiple issues — all keys mapped
  it("[B2] should return 400 with multiple field errors when ZodError has multiple issues", () => {
    const zodErr = makeZodError([
      { path: ["username"], message: "Username is required" },
      { path: ["email"],    message: "Invalid email format" },
      { path: ["password"], message: "Password too short" },
    ]);
    const schema = makeParseSchema({ throws: zodErr });
    const req    = { body: {} };
    const res    = mockRes();
    const next   = jest.fn();

    validateInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: {
        username: "Username is required",
        email:    "Invalid email format",
        password: "Password too short",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [C] Non-ZodError thrown — fallback 500
  it("[C] should return 500 when schema.parse throws a non-Zod error", () => {
    const schema = makeParseSchema({ throws: new Error("Unexpected failure") });
    const req    = { body: {} };
    const res    = mockRes();
    const next   = jest.fn();

    validateInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [C] edge — thrown value is not an Error instance at all (e.g. a string)
  it("[C] should return 500 when schema.parse throws a non-Error primitive", () => {
    const schema = { parse: jest.fn(() => { throw "string error"; }) };
    const req    = { body: {} };
    const res    = mockRes();
    const next   = jest.fn();

    validateInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

/* =====================================================
   SUITE: validateFormFieldsInput(schema)
   [D] req.body.data falsy/missing   → 400 "Data not found"
   [E1] safeParse fails, nested path → key = "section.field"
   [E2] safeParse fails, empty path  → key = "root"
   [E3] two issues, same key         → first error preserved
   [E4] two issues, different keys   → both preserved independently
   [F] safeParse succeeds            → req.body.data = result.data, next()
===================================================== */
describe("validateFormFieldsInput()", () => {
  beforeEach(() => jest.clearAllMocks());

  // [D] req.body is undefined → 400
  it("[D] should return 400 when req.body is undefined", () => {
    const schema = makeSafeParseSchema({ success: true, data: {} });
    const req    = {};          // no body at all
    const res    = mockRes();
    const next   = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Data not found" });
    expect(schema.safeParse).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  // [D] req.body.data is null → 400
  it("[D] should return 400 when req.body.data is null", () => {
    const schema = makeSafeParseSchema({ success: true, data: {} });
    const req    = { body: { data: null } };
    const res    = mockRes();
    const next   = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Data not found" });
    expect(next).not.toHaveBeenCalled();
  });

  // [D] req.body.data is empty string → 400
  it("[D] should return 400 when req.body.data is an empty string (falsy)", () => {
    const schema = makeSafeParseSchema({ success: true, data: {} });
    const req    = { body: { data: "" } };
    const res    = mockRes();
    const next   = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Data not found" });
    expect(next).not.toHaveBeenCalled();
  });

  // [E1] safeParse fails — nested path → key = "issuingSection.receivingNo"
  it("[E1] should return 400 with dot-joined nested path as key when path is non-empty", () => {
    const schema = makeSafeParseSchema({
      success: false,
      error: {
        issues: [
          {
            path:    ["issuingSection", "receivingNo"],
            message: "Receiving number is required",
          },
        ],
      },
    });
    const req  = { body: { data: { issuingSection: {} } } };
    const res  = mockRes();
    const next = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors:  { "issuingSection.receivingNo": "Receiving number is required" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [E1] single top-level path segment → key = "fieldName" (path.join(".") of one item)
  it("[E1] should return 400 with the field name as key for a single-segment path", () => {
    const schema = makeSafeParseSchema({
      success: false,
      error: {
        issues: [
          { path: ["email"], message: "Invalid email" },
        ],
      },
    });
    const req  = { body: { data: {} } };
    const res  = mockRes();
    const next = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors:  { email: "Invalid email" },
    });
  });

  // [E2] safeParse fails — empty path [] → key = "root"
  it("[E2] should use 'root' as key when issue path is empty (root-level schema error)", () => {
    const schema = makeSafeParseSchema({
      success: false,
      error: {
        issues: [
          { path: [], message: "Body must be an object" },
        ],
      },
    });
    const req  = { body: { data: "not-an-object" } };
    const res  = mockRes();
    const next = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors:  { root: "Body must be an object" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [E3] Two issues with the SAME key → only first error preserved
  it("[E3] should preserve only the first error when multiple issues share the same path key", () => {
    const schema = makeSafeParseSchema({
      success: false,
      error: {
        issues: [
          { path: ["email"], message: "Email is required" },    // first → kept
          { path: ["email"], message: "Invalid email format" },  // second → discarded
        ],
      },
    });
    const req  = { body: { data: {} } };
    const res  = mockRes();
    const next = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: { email: "Email is required" },   // second message NOT present
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [E4] Multiple issues with DIFFERENT keys → all independently captured
  it("[E4] should capture errors for all distinct path keys when issues have different paths", () => {
    const schema = makeSafeParseSchema({
      success: false,
      error: {
        issues: [
          { path: ["issuingSection", "receivingNo"], message: "Receiving No. required" },
          { path: ["defectivenessDetail", "part"],   message: "Part is required" },
          { path: [],                                message: "Root structure invalid" },
        ],
      },
    });
    const req  = { body: { data: {} } };
    const res  = mockRes();
    const next = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: {
        "issuingSection.receivingNo": "Receiving No. required",
        "defectivenessDetail.part":   "Part is required",
        "root":                        "Root structure invalid",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [F] safeParse succeeds → req.body.data replaced with result.data, next() called
  it("[F] should replace req.body.data with parsed data and call next() on success", () => {
    const coercedData = { issuingSection: { receivingNo: "RN-001" } };
    const schema = makeSafeParseSchema({ success: true, data: coercedData });
    const req    = { body: { data: { issuingSection: { receivingNo: "RN-001" } } } };
    const res    = mockRes();
    const next   = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(schema.safeParse).toHaveBeenCalledWith(req.body.data);
    expect(req.body.data).toBe(coercedData);   // replaced with validated/coerced data
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  // [F] edge — req.body.data is 0 (falsy number) → hits [D] guard, NOT [F]
  it("[D] should return 400 when req.body.data is 0 (falsy value)", () => {
    const schema = makeSafeParseSchema({ success: true, data: {} });
    const req    = { body: { data: 0 } };
    const res    = mockRes();
    const next   = jest.fn();

    validateFormFieldsInput(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Data not found" });
    expect(next).not.toHaveBeenCalled();
  });
});
