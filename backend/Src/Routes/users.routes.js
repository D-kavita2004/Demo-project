import express from "express";
import { getAllUsers } from "../Controllers/users.controller.js";

const router = express.Router();

router.get("/allUsers",getAllUsers);
export default router;