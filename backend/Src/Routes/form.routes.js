import express from "express";
import { getAllForms, createNewIssue, handleProdResponse, handleReject, handleApprove, handleFinalSubmit} from "../Controllers/form.controller.js";
import { uploadImage } from "../Middlewares/upload.middleware.js";
const router = express.Router();

router.get("/",getAllForms);
router.post("/",uploadImage, createNewIssue);

router.put("/reject",handleReject);
router.put("/approve",handleApprove);
router.put("/prodResponse",handleProdResponse);
router.put("/finalSubmit",handleFinalSubmit);

export default router;