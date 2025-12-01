import express from "express";
import { handleLogin, handleLogout, handleSignUp, forgotPassword, resetPassword} from "../Controllers/authentication.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { registerUserSchema,loginUserSchema } from "../ValidationSchema/authValidationSchema.js";

const router = express.Router();

router.post("/login",validateInput(loginUserSchema), handleLogin);
router.post("/register",validateInput(registerUserSchema), handleSignUp);
router.get("/logout", handleLogout);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/",resetPassword);

export default router;