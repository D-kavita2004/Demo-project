import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../Controllers/suppliers.controller.js";

const router = express.Router();

// CREATE Supplier
router.post("/createSupplier", createSupplier);

// GET All Suppliers
router.get("/", getSuppliers);

// UPDATE Supplier
router.put("/updateSupplier/:id", updateSupplier);

// DELETE Supplier
router.delete("/deleteSupplier/:id", deleteSupplier);

export default router;