import express from "express";
import { handleLogin,handleLogout,handleSignUp} from "../Controllers/authentication.controller.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/register", handleSignUp);
router.get("/logout", handleLogout);

export default router;