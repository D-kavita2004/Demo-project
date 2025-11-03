import express from "express";
import { handleGoogleAuthCallback,handleLogin,handleLogout,handleSignUp,handleRedirectionToGoogleAuthServer } from "../Controllers/authentication.controller.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/register", handleSignUp);
router.get("/redirect-google", handleRedirectionToGoogleAuthServer);
router.get("/google/callback", handleGoogleAuthCallback);
router.get("/logout", handleLogout);

export default router;