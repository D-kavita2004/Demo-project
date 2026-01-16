import express from "express";
import { createMachine,deleteMachine,updateMachine,getMachines } from "../Controllers/machines.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { machineSchema } from "../ValidationSchema/entityValidationSchema.js";
import { checkAuthorization } from "../Middlewares/checkAdmin.middleware.js";
const router = express.Router();

router.post("/", validateInput(machineSchema), checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), createMachine);

router.get("/", checkAuthorization({ allowedFlags: ["QA", "IT"], allowedRoles: ["admin"] }), getMachines);

router.put("/:machineCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), validateInput(machineSchema), updateMachine);

router.delete("/:machineCode", checkAuthorization({ allowedFlags: ["IT"], allowedRoles: ["admin"] }), deleteMachine);

export default router;