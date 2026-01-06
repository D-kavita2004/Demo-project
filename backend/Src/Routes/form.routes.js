import express from "express";
import { getAllForms, createNewIssue, handleProdResponse, handleReject, handleApprove, handleFinalSubmit} from "../Controllers/form.controller.js";
import { uploadImage } from "../Middlewares/upload.middleware.js";
const router = express.Router();

router.post("/createForm",uploadImage, createNewIssue);
router.post("/reject",handleReject);
router.post("/approve",handleApprove);
router.post("/prodResponse",handleProdResponse);
router.post("/finalSubmit",handleFinalSubmit);
router.post("/allForms",getAllForms);

export default router;

