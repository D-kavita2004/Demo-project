import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  getSuppliersForUserAssignment,
} from "../Controllers/suppliers.controller.js";
import { validateInput } from "../Middlewares/validateInput.middleware.js";
import { supplierSchema } from "../ValidationSchema/entityValidationSchema.js";

const router = express.Router();

// CREATE Supplier
router.post("/createSupplier", validateInput(supplierSchema), createSupplier);

// GET All Suppliers
router.get("/", getSuppliers);

// GET All Suppliers
router.get("/", getSuppliers);

// GET All Suppliers for User Assignment
router.get("/forUserAssignment", getSuppliersForUserAssignment);

// UPDATE Supplier
router.put("/updateSupplier/:supplierCode", validateInput(supplierSchema), updateSupplier);

// DELETE Supplier
router.delete("/deleteSupplier/:supplierCode", deleteSupplier);

export default router;