import { checkAuthorization } from "../../Middlewares/checkAuthorisation.middleware.js";
import { jest } from "@jest/globals";

describe("checkAuthorization middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  // ============================
  // AUTHENTICATION TESTS
  // ============================

  it("should return 401 if user is not authenticated", () => {
    const middleware = checkAuthorization({
      allowedFlags: ["QA"],
      allowedRoles: ["ADMIN"],
    });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authentication required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // ============================
  // AUTHORIZATION FAILURE
  // ============================

  it("should return 403 if user flag and role are not allowed", () => {
    req.user = {
      role: "USER",
      team: { flag: "INTERNAL" },
    };

    const middleware = checkAuthorization({
      allowedFlags: ["QA"],
      allowedRoles: ["ADMIN"],
    });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Access denied. You are not authorized for this action.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // ============================
  // FLAG BASED ACCESS
  // ============================

  it("should allow access if user flag is allowed", () => {
    req.user = {
      role: "USER",
      team: { flag: "QA" },
    };

    const middleware = checkAuthorization({
      allowedFlags: ["QA"],
      allowedRoles: ["ADMIN"],
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // ============================
  // ROLE BASED ACCESS
  // ============================

  it("should allow access if user role is allowed", () => {
    req.user = {
      role: "ADMIN",
      team: { flag: "INTERNAL" },
    };

    const middleware = checkAuthorization({
      allowedFlags: ["QA"],
      allowedRoles: ["ADMIN"],
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // ============================
  // BOTH FLAG & ROLE ALLOWED
  // ============================

  it("should allow access if both flag and role are allowed", () => {
    req.user = {
      role: "ADMIN",
      team: { flag: "QA" },
    };

    const middleware = checkAuthorization({
      allowedFlags: ["QA"],
      allowedRoles: ["ADMIN"],
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ============================
  // DEFAULT PARAMS
  // ============================

  it("should return 403 when allowedFlags and allowedRoles are empty", () => {
    req.user = {
      role: "ADMIN",
      team: { flag: "QA" },
    };

    const middleware = checkAuthorization();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Access denied. You are not authorized for this action.",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
