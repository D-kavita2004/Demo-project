import { ZodError } from "zod"; // needed to type-check errors if desired
import logger from "../../Config/logger.js";

export const validateInput = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body); // throws ZodError if invalid
    req.body = parsed; 

    next();
  } catch (err) {
    if(err instanceof ZodError) {
      const errObj = err.issues.reduce((acc, e) => {
        acc[e.path[0]] = e.message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        errors: errObj, 
      });
    }

    // fallback for unexpected errors
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
