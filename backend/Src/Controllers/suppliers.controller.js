import Supplier from "../Models/suppliers.models.js";
import logger from "../../Config/logger.js";

// =========================
// CREATE SUPPLIER
// =========================
export const createSupplier = async (req, res) => {
  try {
    const { supplierName } = req.body;

    if (!supplierName) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const existing = await Supplier.findOne({ supplierName });
    if (existing) {
      return res.status(409).json({ message: "Supplier already exists" });
    }

    const supplier = await Supplier.create({ supplierName });
    res.status(201).json({ message: "Supplier created successfully", supplier });
  } catch (error) {
    logger.error("Create Supplier Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// GET ALL SUPPLIERS
// =========================
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    logger.error("Get Suppliers Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// UPDATE SUPPLIER
// =========================
export const updateSupplier = async (req, res) => {
  try {
    const { supplierName } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { supplierName },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    logger.error("Update Supplier Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// DELETE SUPPLIER
// =========================
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    logger.error("Delete Supplier Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
