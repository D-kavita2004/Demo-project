import express from "express";
import { handleLogin, handleLogout, handleSignUp, forgotPassword, resetPassword} from "../Controllers/authentication.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { registerUserSchema,loginUserSchema,resetPasswordSchema,forgetPasswordSchema } from "../ValidationSchema/authValidationSchema.js";
import { checkAdmin } from "../Middlewares/checkAdmin.middleware.js";

const router = express.Router();

router.post("/login", validateInput(loginUserSchema), handleLogin);
router.get("/logout", handleLogout);
router.post("/forgot-password", validateInput(forgetPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validateInput(resetPasswordSchema), resetPassword);

router.post("/register",checkAdmin, validateInput(registerUserSchema), handleSignUp);

export default router;