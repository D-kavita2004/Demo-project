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
import { checkAuthorization } from "../Middlewares/checkAuthorisation.middleware.js";

const router = express.Router();

// CREATE Supplier
router.post("/", validateInput(supplierSchema),checkAuthorization({ allowedFlags: ["IT"],allowedRoles:["admin"] }),createSupplier);

// GET All Suppliers
router.get("/", checkAuthorization({ allowedFlags: ["QA","IT"],allowedRoles:["admin"] }), getSuppliers);

// GET All Suppliers for User Assignment
router.get("/forUserAssignment",checkAuthorization({ allowedFlags: ["IT"],allowedRoles:["admin"] }), getSuppliersForUserAssignment);

// UPDATE Supplier
router.put("/:supplierCode", validateInput(supplierSchema),checkAuthorization({ allowedFlags: ["IT"],allowedRoles:["admin"] }), updateSupplier);

// DELETE Supplier
router.delete("/:supplierCode",checkAuthorization({ allowedFlags: ["IT"],allowedRoles:["admin"] }), deleteSupplier);

export default router;