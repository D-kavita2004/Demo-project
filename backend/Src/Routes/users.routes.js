import express from "express";
import { getAllUsers } from "../Controllers/users.controller.js";
import { handleSignUp } from "../Controllers/users.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { registerUserSchema } from "../ValidationSchema/authValidationSchema.js";

const router = express.Router();

router.post("/register", validateInput(registerUserSchema), handleSignUp);
router.get("/allUsers",getAllUsers);
export default router;