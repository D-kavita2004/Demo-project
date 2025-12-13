import express from "express";
import {createProcess, deleteProcess, updateProcess, getProcesses} from "../Controllers/processes.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { processSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

// CREATE Supplier
router.post("/createProcess", validateInput(processSchema), createProcess);

// GET All Suppliers
router.get("/", getProcesses);

// UPDATE Supplier
router.put("/updateProcess/:id", validateInput(processSchema), updateProcess);

// DELETE Supplier
router.delete("/deleteProcess/:id", deleteProcess);

export default router;