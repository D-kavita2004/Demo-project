import express from "express";
import { createMachine,deleteMachine,updateMachine,getMachines } from "../Controllers/machines.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { machineSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

// CREATE Supplier
router.post("/createMachine", validateInput(machineSchema), createMachine);

// GET All Suppliers
router.get("/", getMachines);

// UPDATE Supplier
router.put("/updateMachine/:id", validateInput(machineSchema), updateMachine);

// DELETE Supplier
router.delete("/deleteMachine/:id", deleteMachine);

export default router;