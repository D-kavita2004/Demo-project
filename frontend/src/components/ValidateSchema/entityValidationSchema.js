import { z } from "zod";

/**
 * Reusable name validation
 */
export const nameFieldSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(
    /^[a-zA-Z]+([-\s]?[a-zA-Z0-9]+)*$/,
    "Must start with a letter. Only letters and numbers are allowed, with spaces or hyphens between words."
  );


/**
 * Entity schemas
 */
export const supplierSchema = z.object({
  supplierName: nameFieldSchema,
});

export const partSchema = z.object({
  partName: nameFieldSchema,
});

export const processSchema = z.object({
  processName: nameFieldSchema,
});

export const machineSchema = z.object({
  machineName: nameFieldSchema,
});
