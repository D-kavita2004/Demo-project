import { jest } from "@jest/globals";
import { parseMultipartJSON } from "../../Middlewares/parseFormData.middleware.js";

// ============================
// HELPERS
// ============================

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // returns res so we can chain .json()
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("parseMultipartJSON middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = mockRes(); // ✅ use helper here
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if data is not provided", () => {
    parseMultipartJSON(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if data is invalid JSON", () => {
    req.body.data = "{ invalid json }";

    parseMultipartJSON(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid JSON format",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should parse JSON and call next when data is valid", () => {
    req.body.data = JSON.stringify({ name: "Kavita", role: "QA" });

    parseMultipartJSON(req, res, next);

    expect(req.body.data).toEqual({ name: "Kavita", role: "QA" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
