import express from "express";
import { createPart,deletePart,updatePart,getParts } from "../Controllers/parts.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { partSchema } from "../ValidationSchema/entityValidationSchema.js";
import { checkAuthorization } from "../Middlewares/checkAuthorisation.middleware.js";
const router = express.Router();

router.post("/", validateInput(partSchema), checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), createPart);

router.get("/", checkAuthorization({ allowedFlags: ["QA", "IT"], allowedRoles: ["admin"] }), getParts);

router.put("/:partCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), validateInput(partSchema), updatePart);

router.delete("/:partCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), deletePart);

export default router;