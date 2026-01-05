import express from "express";
import { createPart,deletePart,updatePart,getParts } from "../Controllers/parts.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { partSchema } from "../ValidationSchema/entityValidationSchema.js";
import { checkAuthorization } from "../Middlewares/checkAdmin.middleware.js";
const router = express.Router();

router.post("/createPart", validateInput(partSchema), checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), createPart);

router.get("/", checkAuthorization({ allowedFlags: ["QA", "IT"], allowedRoles: ["admin"] }), getParts);

router.put("/updatePart/:partCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), validateInput(partSchema), updatePart);

router.delete("/deletePart/:partCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), deletePart);

export default router;