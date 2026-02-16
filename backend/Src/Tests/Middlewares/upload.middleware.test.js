import { jest } from "@jest/globals";

/* ===================================================
   MOCK MODULES (ESM) — must come before any imports
=================================================== */

const mockExistsSync = jest.fn();
const mockMkdirSync  = jest.fn();
jest.unstable_mockModule("fs", () => ({
  default: {
    existsSync: mockExistsSync,
    mkdirSync:  mockMkdirSync,
  },
}));

const mockLogger = { info: jest.fn(), error: jest.fn() };
jest.unstable_mockModule("../../../Config/logger.js", () => ({
  default: mockLogger,
}));

// We'll capture the multer config so we can invoke internal callbacks directly.
// multer itself needs to run (not be fully mocked), but we intercept what it receives.
let capturedStorageConfig = null;
let capturedFilterFn      = null;
let capturedLimits        = null;

// The mock for the upload.any() call inside uploadFile.
// mockAnyFn is the function returned by upload.any().
// It must be re-attached after every jest.clearAllMocks() call, because
// clearAllMocks() resets implementations — so mockUploadObj.any() would
// return undefined instead of mockAnyFn.  We fix this by using
// mockReturnValue (stored value survives clearAllMocks) and by restoring
// mockAnyFn's implementation inside each suite's beforeEach.
const mockAnyFn     = jest.fn();
const mockUploadObj = { any: jest.fn().mockReturnValue(mockAnyFn) };

jest.unstable_mockModule("multer", () => {
  const multerMock = jest.fn((config) => {
    // Capture the config passed into multer({...}) so tests can call
    // storage.getDestination / storage.getFilename / fileFilter directly.
    capturedStorageConfig = config.storage;
    capturedFilterFn      = config.fileFilter;
    capturedLimits        = config.limits;
    return mockUploadObj;
  });

  // multer.diskStorage must return an object with getDestination / getFilename
  multerMock.diskStorage = jest.fn((config) => ({
    getDestination: config.destination,
    getFilename:    config.filename,
    // Keep refs to the raw fns so tests can call them
    _destination: config.destination,
    _filename:    config.filename,
  }));

  return { default: multerMock };
});

// crypto.randomUUID — deterministic in tests
jest.unstable_mockModule("crypto", () => ({
  default: { randomUUID: jest.fn(() => "test-uuid-1234") },
}));

/* ===================================================
   IMPORT MODULE UNDER TEST (after mocks registered)
=================================================== */
const { uploadFile } = await import("../../Middlewares/upload.middleware.js");

/* ===================================================
   HELPERS
=================================================== */
const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json:   jest.fn(),
});

/** Build a minimal fake multer file object */
const makeFile = (fieldname, originalname, mimetype) => ({
  fieldname,
  originalname,
  mimetype,
  filename: `test-uuid-1234${require_ext(originalname)}`,
});

function require_ext(name) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/** Call storage.getDestination with a fake req/file, return promise */
const callDestination = (fieldname) =>
  new Promise((resolve, reject) => {
    capturedStorageConfig.getDestination(
      { user: { userId: "u1" } },
      { fieldname },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });

/** Call storage.getFilename with a fake req/file, return promise {filename} */
const callFilename = (fieldname, originalname) =>
  new Promise((resolve, reject) => {
    capturedStorageConfig.getFilename(
      { user: { userId: "u1" } },
      { fieldname, originalname },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });

/** Call fileFilter callback, return promise {allow: bool} or reject with err */
const callFileFilter = (fieldname, mimetype) =>
  new Promise((resolve, reject) => {
    capturedFilterFn(
      {},
      { fieldname, mimetype },
      (err, allow) => (err ? reject(err) : resolve(allow)),
    );
  });

/* ===================================================
   SUITE 1 — storage.destination()
   Branches A B C D E
=================================================== */
describe("storage.destination()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore mockUploadObj.any → mockAnyFn binding after clearAllMocks wipes it
    mockUploadObj.any.mockReturnValue(mockAnyFn);
  });

  // [A] + [D]  productImage, dir does not exist → mkdir + cb "image-uploads"
  it("[A+D] should set destination to 'image-uploads' and create it when missing", async () => {
    mockExistsSync.mockReturnValue(false);

    const result = await callDestination("productImage");

    expect(result).toBe("image-uploads");
    expect(mockMkdirSync).toHaveBeenCalledWith("image-uploads", { recursive: true });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Created upload directory",
      { path: "image-uploads" },
    );
  });

  // [A] + [E]  productImage, dir already exists → skip mkdir
  it("[A+E] should not call mkdirSync when 'image-uploads' already exists", async () => {
    mockExistsSync.mockReturnValue(true);

    const result = await callDestination("productImage");

    expect(result).toBe("image-uploads");
    expect(mockMkdirSync).not.toHaveBeenCalled();
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  // [B] + [D]  prodFile, dir does not exist → mkdir + cb "production-docs"
  it("[B+D] should set destination to 'production-docs' and create it when missing", async () => {
    mockExistsSync.mockReturnValue(false);

    const result = await callDestination("prodFile");

    expect(result).toBe("production-docs");
    expect(mockMkdirSync).toHaveBeenCalledWith("production-docs", { recursive: true });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Created upload directory",
      { path: "production-docs" },
    );
  });

  // [B] + [E]  prodFile, dir already exists → skip mkdir
  it("[B+E] should not call mkdirSync when 'production-docs' already exists", async () => {
    mockExistsSync.mockReturnValue(true);

    const result = await callDestination("prodFile");

    expect(result).toBe("production-docs");
    expect(mockMkdirSync).not.toHaveBeenCalled();
  });

  // [C]  unknown fieldname → cb(Error)
  it("[C] should call cb with an error for an unknown fieldname", async () => {
    await expect(callDestination("unknownField")).rejects.toThrow("Invalid file field");
    expect(mockMkdirSync).not.toHaveBeenCalled();
  });
});

/* ===================================================
   SUITE 2 — storage.filename()
   Branch F (single path, but must be exercised)
=================================================== */
describe("storage.filename()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadObj.any.mockReturnValue(mockAnyFn);
  });

  // [F]  generates uuid + extension, logs, calls cb
  it("[F] should generate a UUID-based filename preserving the file extension", async () => {
    const result = await callFilename("productImage", "photo.PNG");

    // crypto.randomUUID mocked to "test-uuid-1234"; extname lowercased
    expect(result).toBe("test-uuid-1234.png");
    expect(mockLogger.info).toHaveBeenCalledWith(
      "File saved",
      expect.objectContaining({
        field:        "productImage",
        originalName: "photo.PNG",
        savedAs:      "test-uuid-1234.png",
        userId:       "u1",
      }),
    );
  });

  // [F] edge — file with no extension
  it("[F] should handle files with no extension", async () => {
    const result = await callFilename("prodFile", "report");

    expect(result).toBe("test-uuid-1234");   // no ext appended
    expect(mockLogger.info).toHaveBeenCalled();
  });

  // [F] edge — req.user undefined (userId optional-chained to undefined)
  it("[F] should log userId as undefined when req.user is not set", async () => {
    await new Promise((resolve, reject) => {
      capturedStorageConfig.getFilename(
        {}, // no req.user
        { fieldname: "productImage", originalname: "img.jpg" },
        (err, result) => (err ? reject(err) : resolve(result)),
      );
    });

    expect(mockLogger.info).toHaveBeenCalledWith(
      "File saved",
      expect.objectContaining({ userId: undefined }),
    );
  });
});

/* ===================================================
   SUITE 3 — multer fileFilter()
   Branches G H I
=================================================== */
describe("multer fileFilter()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadObj.any.mockReturnValue(mockAnyFn);
  });

  // [G] productImage + image/* → allowed
  it("[G] should allow productImage with an image/* mimetype", async () => {
    const result = await callFileFilter("productImage", "image/jpeg");
    expect(result).toBe(true);
  });

  it("[G] should allow productImage with image/png mimetype", async () => {
    const result = await callFileFilter("productImage", "image/png");
    expect(result).toBe(true);
  });

  // [H] prodFile + application/pdf → allowed
  it("[H] should allow prodFile with application/pdf mimetype", async () => {
    const result = await callFileFilter("prodFile", "application/pdf");
    expect(result).toBe(true);
  });

  // [I] productImage but non-image mimetype → error
  it("[I] should reject productImage with a non-image mimetype", async () => {
    await expect(
      callFileFilter("productImage", "application/pdf"),
    ).rejects.toThrow("Invalid file type or field name");
  });

  // [I] prodFile but wrong mimetype → error
  it("[I] should reject prodFile with a non-PDF mimetype", async () => {
    await expect(
      callFileFilter("prodFile", "image/jpeg"),
    ).rejects.toThrow("Invalid file type or field name");
  });

  // [I] completely unknown fieldname → error
  it("[I] should reject an entirely unknown fieldname and mimetype", async () => {
    await expect(
      callFileFilter("randomField", "text/plain"),
    ).rejects.toThrow("Invalid file type or field name");
  });
});

/* ===================================================
   SUITE 4 — uploadFile() middleware
   Branches J K L M N O
=================================================== */
describe("uploadFile() middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // After clearAllMocks(), mockUploadObj.any has lost its return value
    // and mockAnyFn has lost its implementation.  Restore both here so
    // upload.any()(req, res, cb) works correctly in every test.
    mockUploadObj.any.mockReturnValue(mockAnyFn);
  });

  /** Drive upload.any() callback with custom err / req mutations */
  const runMiddleware = (reqOverrides = {}, err = null, files = []) => {
    const req = {
      protocol: "http",
      files,
      get: jest.fn((header) => {
        if (header === "host") return "localhost:3000";
        return undefined; // x-forwarded-proto not set by default
      }),
      ...reqOverrides,
    };
    const res  = mockRes();
    const next = jest.fn();

    // mockAnyFn is what upload.any() returns; when called as (req, res, cb) it
    // invokes cb immediately with the provided err.
    mockAnyFn.mockImplementation((_req, _res, cb) => {
      // Simulate multer populating req.files
      _req.files = files;
      cb(err);
    });

    uploadFile(req, res, next);
    return { req, res, next };
  };

  // [J] multer calls back with an error → 400
  it("[J] should return 400 when multer reports an upload error", () => {
    const multerErr = new Error("File too large");
    const { res, next } = runMiddleware({}, multerErr, []);

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Upload failed",
      { error: "File too large" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success:  false,
      message: "File too large",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // [K] No files uploaded → next() called, no URL set
  it("[K] should call next() immediately when no files are uploaded", () => {
    const { req, res, next } = runMiddleware({}, null, []);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.productImageUrl).toBeUndefined();
    expect(req.prodFileUrl).toBeUndefined();
  });

  // [K] req.files is null (edge case) → next() called
  it("[K] should call next() when req.files is null", () => {
    const { next } = runMiddleware({}, null, null);
    expect(next).toHaveBeenCalled();
  });

  // [L] + [O] productImage file, no x-forwarded-proto → uses req.protocol
  it("[L+O] should set req.productImageUrl using req.protocol when x-forwarded-proto is absent", () => {
    const files = [{ fieldname: "productImage", filename: "uuid.jpg" }];
    const { req, next } = runMiddleware({ protocol: "http" }, null, files);

    expect(req.productImageUrl).toBe(
      "http://localhost:3000/image-uploads/uuid.jpg",
    );
    expect(req.prodFileUrl).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  // [L] + [N] productImage file, x-forwarded-proto present → uses that
  it("[L+N] should set req.productImageUrl using x-forwarded-proto when present", () => {
    const files = [{ fieldname: "productImage", filename: "uuid.jpg" }];
    const reqOverrides = {
      protocol: "http",
      get: jest.fn((header) => {
        if (header === "x-forwarded-proto") return "https";
        if (header === "host") return "example.com";
        return undefined;
      }),
    };
    const { req, next } = runMiddleware(reqOverrides, null, files);

    expect(req.productImageUrl).toBe(
      "https://example.com/image-uploads/uuid.jpg",
    );
    expect(next).toHaveBeenCalled();
  });

  // [M] + [O] prodFile → sets req.prodFileUrl
  it("[M+O] should set req.prodFileUrl for a prodFile upload", () => {
    const files = [{ fieldname: "prodFile", filename: "uuid.pdf" }];
    const { req, next } = runMiddleware({ protocol: "https" }, null, files);

    expect(req.prodFileUrl).toBe(
      "https://localhost:3000/production-docs/uuid.pdf",
    );
    expect(req.productImageUrl).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  // [M] + [N] prodFile + x-forwarded-proto
  it("[M+N] should set req.prodFileUrl using x-forwarded-proto for prodFile", () => {
    const files = [{ fieldname: "prodFile", filename: "uuid.pdf" }];
    const reqOverrides = {
      protocol: "http",
      get: jest.fn((header) => {
        if (header === "x-forwarded-proto") return "https";
        if (header === "host") return "secure.host.io";
        return undefined;
      }),
    };
    const { req, next } = runMiddleware(reqOverrides, null, files);

    expect(req.prodFileUrl).toBe(
      "https://secure.host.io/production-docs/uuid.pdf",
    );
    expect(next).toHaveBeenCalled();
  });

  // Guards: a file with an unrecognised fieldname sets neither URL but still calls next
  it("should call next() without setting any URL for an unrecognised fieldname", () => {
    const files = [{ fieldname: "otherField", filename: "uuid.bin" }];
    const { req, next } = runMiddleware({}, null, files);

    expect(req.productImageUrl).toBeUndefined();
    expect(req.prodFileUrl).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});