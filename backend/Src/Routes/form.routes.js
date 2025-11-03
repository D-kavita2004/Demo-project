import express from "express";
import { modifyForm, getAllForms,approveForm } from "../Controllers/form.controller.js";

const router = express.Router();

router.post("/modifyForm",modifyForm);
router.get("/allForms",getAllForms);
router.post("/approveForm",approveForm);

export default router;