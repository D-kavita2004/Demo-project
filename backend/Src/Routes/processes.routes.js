import express from "express";
import {createProcess, deleteProcess, updateProcess, getProcesses} from "../Controllers/processes.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { processSchema } from "../ValidationSchema/entityValidationSchema.js";
import { checkAuthorization } from "../Middlewares/checkAuthorisation.middleware.js";

const router = express.Router();

router.post("/", validateInput(processSchema), checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), createProcess);

router.get("/", checkAuthorization({ allowedFlags: ["QA", "IT"], allowedRoles: ["admin"] }), getProcesses);

router.put("/:processCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), validateInput(processSchema), updateProcess);

router.delete("/:processCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), deleteProcess);

export default router;