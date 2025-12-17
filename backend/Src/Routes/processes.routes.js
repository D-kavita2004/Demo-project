import express from "express";
import {createProcess, deleteProcess, updateProcess, getProcesses} from "../Controllers/processes.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { processSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

router.post("/createProcess", validateInput(processSchema), createProcess);

router.get("/", getProcesses);

router.put("/updateProcess/:processCode", validateInput(processSchema), updateProcess);

router.delete("/deleteProcess/:processCode", deleteProcess);

export default router;