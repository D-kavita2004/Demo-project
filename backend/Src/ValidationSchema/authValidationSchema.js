import { z } from "zod";

// Reusable strong password regex
const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,128}$/;

// Email validator
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Username must be a valid email")
  .min(5, "Email must be at least 5 characters long")
  .max(100, "Email is too long");

// ---------------------- REGISTER SCHEMA ----------------------
export const registerUserSchema = z.object({
  username: emailSchema,
  password: z
    .string()
    .trim()
    .regex(
      strongPasswordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character (@$!%*?&), and be 6-128 characters long",
    ),

  team: z.enum(["Quality", "Production"], {
    errorMap: () => ({
      message: "Team must be either Quality or Production",
    }),
  }),
});

// ---------------------- LOGIN SCHEMA ----------------------
export const loginUserSchema = z.object({
  username: emailSchema,
  password: z
    .string()
    .trim()
    .min(1, "Password is required"),
});
