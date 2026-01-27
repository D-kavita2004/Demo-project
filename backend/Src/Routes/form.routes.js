import express from "express";
import { getAllForms, createNewIssue, handleProdResponse, handleReject, handleApprove, handleFinalSubmit} from "../Controllers/form.controller.js";
import { uploadFile } from "../Middlewares/upload.middleware.js";
import { validateFormFieldsInput } from "../Middlewares/validateInput.middleware.js";
import { parseMultipartJSON } from "../Middlewares/parseFormData.middleware.js";
import { checkAuthorization } from "../Middlewares/checkAuthorisation.middleware.js";
import { NewFormSchema, ProdResponseSchema, QAResponseSchema, FinalResponseSchema } from "../ValidationSchema/formValidationSchema.js";

const router = express.Router();

router.get("/",getAllForms,checkAuthorization({ allowedFlags: ["IT","INTERNAL","QA"], allowedRoles: ["admin"] }));
router.post("/", checkAuthorization({ allowedFlags: ["QA"] }), uploadFile, parseMultipartJSON, validateFormFieldsInput(NewFormSchema), createNewIssue);

router.put("/reject", checkAuthorization({ allowedFlags: ["QA"] }), validateFormFieldsInput(QAResponseSchema), handleReject);
router.put("/approve", checkAuthorization({ allowedFlags: ["QA"] }), validateFormFieldsInput(QAResponseSchema),  handleApprove);

router.put("/prodResponse/:id", checkAuthorization({ allowedFlags: ["INTERNAL"] }), uploadFile, parseMultipartJSON, validateFormFieldsInput(ProdResponseSchema),  handleProdResponse);

router.put("/finalSubmit", checkAuthorization({ allowedFlags: ["QA"] }), validateFormFieldsInput(FinalResponseSchema), handleFinalSubmit);

export default router;