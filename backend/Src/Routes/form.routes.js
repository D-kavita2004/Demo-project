import express from "express";
import { modifyForm, getAllForms,approveForm } from "../Controllers/form.controller.js";
import { uploadImage } from "../Middlewares/upload.middleware.js";
const router = express.Router();

router.post("/modifyForm",uploadImage,modifyForm);
router.post("/allForms",getAllForms);
router.post("/approveForm",approveForm);

export default router;

