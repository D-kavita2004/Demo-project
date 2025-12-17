import express from "express";
import { createPart,deletePart,updatePart,getParts } from "../Controllers/parts.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { partSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

router.post("/createPart", validateInput(partSchema), createPart);

router.get("/", getParts);

router.put("/updatePart/:partCode", validateInput(partSchema), updatePart);

router.delete("/deletePart/:partCode", deletePart);

export default router;