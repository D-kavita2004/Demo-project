import express from "express";
import { getAllForms, createNewIssue, handleProdResponse, handleReject, handleApprove, handleFinalSubmit} from "../Controllers/form.controller.js";
import { uploadFile } from "../Middlewares/upload.middleware.js";
const router = express.Router();

router.get("/",getAllForms);
router.post("/",uploadFile, createNewIssue);

router.put("/reject",handleReject);
router.put("/approve",handleApprove);
router.put("/prodResponse/:id",uploadFile, handleProdResponse);
router.put("/finalSubmit",handleFinalSubmit);

export default router;