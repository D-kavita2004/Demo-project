import express from "express";
import { createMachine,deleteMachine,updateMachine,getMachines } from "../Controllers/machines.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { machineSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

router.post("/createMachine", validateInput(machineSchema), createMachine);

router.get("/", getMachines);

router.put("/updateMachine/:machineCode", validateInput(machineSchema), updateMachine);

router.delete("/deleteMachine/:machineCode", deleteMachine);

export default router;