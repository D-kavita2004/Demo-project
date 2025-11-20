import { ZodError } from "zod";

export const validateInput = (schema, data) => {
  try {
    const parsed = schema.parse(data); // throws ZodError if invalid
    return { success: true, data: parsed }; 

  } catch (err) {
      
    if (err instanceof ZodError) {
      const errors = err.issues.reduce((acc, e) => {
        acc[e.path[0]] = e.message;
        return acc;
      }, {});
      return { success: false, errors }; // clearly indicate failure
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
};
