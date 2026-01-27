import { jest } from "@jest/globals";
import { z } from "zod";
import {
  validateInput,
  validateFormFieldsInput,
} from "../../Middlewares/validateInput.middleware.js";

// ============================
// HELPERS
// ============================

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe("validateInput middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ============================
  // SUCCESS CASE
  // ============================

  it("should validate input and call next on valid data", () => {
    const schema = z.object({
      username: z.string(),
      age: z.number(),
    });

    req.body = {
      username: "kavita",
      age: 25,
    };

    const middleware = validateInput(schema);
    middleware(req, res, next);

    expect(req.body).toEqual({
      username: "kavita",
      age: 25,
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // ============================
  // ZOD VALIDATION ERROR
  // ============================

  it("should return 400 with formatted errors on validation failure", () => {
    const schema = z.object({
      username: z.string(),
      age: z.number(),
    });

    req.body = {
      username: "kavita",
      age: "twenty", // invalid
    };

    const middleware = validateInput(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: {
        age: expect.any(String),
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // ============================
  // UNEXPECTED ERROR
  // ============================

  it("should return 500 on unexpected error", () => {
    const schema = {
      parse: () => {
        throw new Error("Unexpected error");
      },
    };

    const middleware = validateInput(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
    expect(next).not.toHaveBeenCalled();
  });
});


// =====================================================================
// validateFormFieldsInput TESTS
// =====================================================================

describe("validateFormFieldsInput middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = mockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ============================
  // DATA NOT FOUND
  // ============================

  it("should return 400 if req.body.data is missing", () => {
    const schema = z.object({
      name: z.string(),
    });

    const middleware = validateFormFieldsInput(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Data not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // ============================
  // VALID DATA
  // ============================

  it("should validate data and call next on success", () => {
    const schema = z.object({
      name: z.string(),
      quantity: z.number(),
    });

    req.body.data = {
      name: "Item A",
      quantity: 10,
    };

    const middleware = validateFormFieldsInput(schema);
    middleware(req, res, next);

    expect(req.body.data).toEqual({
      name: "Item A",
      quantity: 10,
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // ============================
  // VALIDATION FAILURE
  // ============================

  it("should return 400 with formatted errors when validation fails", () => {
    const schema = z.object({
      name: z.string(),
      quantity: z.number(),
    });

    req.body.data = {
      name: "Item A",
      quantity: "ten",
    };

    const middleware = validateFormFieldsInput(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: {
        quantity: expect.any(String),
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  // ============================
  // NESTED FIELD ERROR
  // ============================

  it("should handle nested field validation errors", () => {
    const schema = z.object({
      section: z.object({
        receivingNo: z.number(),
      }),
    });

    req.body.data = {
      section: {
        receivingNo: "ABC",
      },
    };

    const middleware = validateFormFieldsInput(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: {
        "section.receivingNo": expect.any(String),
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
