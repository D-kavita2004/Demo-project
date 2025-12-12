import { z } from "zod";

export const supplierSchema = z.object({
  supplierName: z
    .string()
    .trim()
    .min(3, "Supplier name must be at least 3 characters")
    .max(50, "Supplier name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9]+([-\s]?[a-zA-Z0-9]+)*$/,
      "Supplier name can only contain letters, numbers, spaces, and hyphens (no special characters or extra spaces)"
    ),
});
