import { jest } from "@jest/globals";
import { de } from "zod/locales";

let multerError = null;

// ============================
// MOCK DEPENDENCIES
// ============================

// Mock multer
jest.unstable_mockModule("multer", () => {
  const multerMock = jest.fn(() => ({
    any: () => (req, res, cb) => cb(multerError),
  }));
  multerMock.diskStorage = jest.fn(() => ({}));
  return { default: multerMock };
});

// Mock fs
jest.unstable_mockModule("fs", () => ({
  default:{
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
  },
}));

// Mock crypto
jest.unstable_mockModule("crypto", () => ({
  default:{
    randomUUID: jest.fn(() => "mock-uuid"),
  },
}));

// Mock logger
jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// ============================
// IMPORT MODULE UNDER TEST
// ============================

const { uploadFile } = await import(
  "../../Middlewares/upload.middleware.js"
);
const logger = (await import("../../../Config/logger.js")).default;

// ============================
// HELPERS
// ============================

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const mockReq = () => ({
  get: jest.fn((key) => {
    if (key === "host") return "localhost:3000";
    if (key === "x-forwarded-proto") return "http";
  }),
  protocol: "http",
  files: [],
});

// ============================
// TEST SUITE
// ============================

describe("uploadFile middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
    next = jest.fn();
    multerError = null;
    jest.clearAllMocks();
  });

  // ----------------------------
  // No file uploaded
  // ----------------------------
  it("should call next if no files are uploaded", () => {
    uploadFile(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // ----------------------------
  // Product image uploaded
  // ----------------------------
  it("should attach productImageUrl when productImage is uploaded", () => {
    req.files = [
      {
        fieldname: "productImage",
        filename: "image.png",
      },
    ];

    uploadFile(req, res, next);

    expect(req.productImageUrl).toBe(
      "http://localhost:3000/image-uploads/image.png",
    );
    expect(next).toHaveBeenCalled();
  });

  // ----------------------------
  // Production file uploaded
  // ----------------------------
  it("should attach prodFileUrl when prodFile is uploaded", () => {
    req.files = [
      {
        fieldname: "prodFile",
        filename: "doc.pdf",
      },
    ];

    uploadFile(req, res, next);

    expect(req.prodFileUrl).toBe(
      "http://localhost:3000/production-docs/doc.pdf",
    );
    expect(next).toHaveBeenCalled();
  });

  // ----------------------------
  // Multer throws an error
  // ----------------------------
  it("should return 400 if multer throws an error", () => {
    multerError = new Error("Invalid file type or field name");

    uploadFile(req, res, next);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid file type or field name",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
