import express from "express";
import { getAllForms, createNewIssue, handleProdResponse, handleReject, handleApprove, handleFinalSubmit} from "../Controllers/form.controller.js";
import { uploadFile } from "../Middlewares/upload.middleware.js";
import { validateFormFieldsInput } from "../Middlewares/validateInput.middleware.js";
import { parseMultipartJSON } from "../Middlewares/parseFormData.middleware.js";
import { NewFormSchema, ProdResponseSchema, QAResponseSchema, FinalResponseSchema } from "../ValidationSchema/formValidationSchema.js";

const router = express.Router();

router.get("/",getAllForms);
router.post("/", uploadFile, parseMultipartJSON, validateFormFieldsInput(NewFormSchema), createNewIssue);

router.put("/reject", validateFormFieldsInput(QAResponseSchema), handleReject);
router.put("/approve", validateFormFieldsInput(QAResponseSchema), handleApprove);
router.put("/prodResponse/:id", uploadFile, parseMultipartJSON, validateFormFieldsInput(ProdResponseSchema), handleProdResponse);
router.put("/finalSubmit",validateFormFieldsInput(FinalResponseSchema), handleFinalSubmit);

export default router;