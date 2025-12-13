import express from "express";
import { createPart,deletePart,updatePart,getParts } from "../Controllers/parts.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { partSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

// CREATE Supplier
router.post("/createPart", validateInput(partSchema), createPart);

// GET All Suppliers
router.get("/", getParts);

// UPDATE Supplier
router.put("/updatePart/:id", validateInput(partSchema), updatePart);

// DELETE Supplier
router.delete("/deletePart/:id", deletePart);

export default router;