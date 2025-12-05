import express from "express";
import { changeUserStatus, getAllUsers, updateUser } from "../Controllers/users.controller.js";
import { handleSignUp } from "../Controllers/users.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { registerUserSchema } from "../ValidationSchema/authValidationSchema.js";

const router = express.Router();

router.post("/register", validateInput(registerUserSchema), handleSignUp);
router.get("/allUsers",getAllUsers);
router.put("/changeStatus",changeUserStatus);
router.put("/update/:username",updateUser);

export default router;