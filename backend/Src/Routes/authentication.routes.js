import express from "express";
import { handleLogin, handleLogout, forgotPassword, resetPassword} from "../Controllers/authentication.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { loginUserSchema,resetPasswordSchema,forgetPasswordSchema } from "../ValidationSchema/authValidationSchema.js";

const router = express.Router();

router.post("/login", validateInput(loginUserSchema), handleLogin);
router.get("/logout", handleLogout);
router.post("/forgot-password", validateInput(forgetPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validateInput(resetPasswordSchema), resetPassword);



export default router;