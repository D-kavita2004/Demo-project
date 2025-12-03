import { z } from "zod";

// ------------------ STRONG PASSWORD REGEX ------------------
const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,128}$/;

// ------------------ EMAIL VALIDATION ------------------
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email must be valid")
  .min(5, "Email must be at least 5 characters long")
  .max(100, "Email is too long");

// ------------------ USERNAME VALIDATION ------------------
const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must not exceed 30 characters")
  .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      "Username must start with a letter and can contain letters, numbers, underscores, and hyphens"
    );

// ------------------ TEAM ENUM ------------------
const teamSchema = z.enum(["QA", "Part", "Fit", "Assembly", "IT"], {
  errorMap: () => ({
    message: "Team must be one of: QA, Part, Fit, Assembly, IT",
  }),
});


// ------------------ NAME REGEX ------------------
// Allows letters, spaces, hyphens, apostrophes (e.g., Anne-Marie, O'Connor)
const nameRegex = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;

// ------------------ REGISTER SCHEMA ------------------
export const registerUserSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .regex(nameRegex, "First name can contain only alphabets, spaces, hyphens or apostrophes"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .regex(nameRegex, "Last name can contain only alphabets, spaces, hyphens or apostrophes"),
    password: z
      .string()
      .trim()
      .regex(
        strongPasswordRegex,
        "Password must contain at least one uppercase, one lowercase, one number, one special character, and be 6–128 characters long"
      ),
      team: teamSchema
  })

// ------------------ LOGIN SCHEMA ------------------
export const loginUserSchema = z.object({
  username: usernameSchema,
  password: z.string().trim().min(1, "Password is required"),
});
