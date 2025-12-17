import Supplier from "../Models/suppliers.models.js";
import logger from "../../Config/logger.js";
import User from "../Models/users.models.js";
// =========================
// CREATE SUPPLIER
// =========================
export const createSupplier = async (req, res) => {
  try {
    const supplierName = req.body.supplierName.trim().toLowerCase();

    const existing = await Supplier.findOne({ supplierName });
    if (existing) {
      return res.status(409).json({ message: "Supplier already exists" });
    }

    const supplier = await Supplier.create({ supplierName });
    const newSupplier = {supplierCode:supplier.supplierCode, supplierName:supplier.supplierName};

    res.status(201).json({ message: "Supplier created successfully", supplier:newSupplier });

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
    const suppliers = await Supplier.find(
      { supplierName: { $ne: "it" } },
      { __v: 0, createdAt: 0, updatedAt: 0, _id: 0 },
    ).lean();
    res.status(200).json({
      message:"All Suppliers fetched Successfully",
      suppliers,
    });
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
    const supplierName = req.body.supplierName.trim().toLowerCase();
    const supplierCode = req.params.supplierCode;

    // Check duplicate (exclude current supplier)
    const existingSupplier = await Supplier.findOne({
      supplierName,
      supplierCode: { $ne: supplierCode },
    });

    if (existingSupplier) {
      return res
        .status(409)
        .json({ message: "Supplier name already exists" });
    }

    // Update
    const supplier = await Supplier.findOneAndUpdate(
      { supplierCode },
      { supplierName },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier,
    });

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
    const code = req.params.supplierCode;
    const team = await Supplier.exists({ supplierCode: code });

    // check whether this supplier is assigned to some user or not
    if(!team){
      return res.status(404).json({ message: "Supplier not found" });
    }
    const isAssigned = await User.exists({ team: team._id });
    if(isAssigned){
      return res.status(409).json({ message: "Cannot delete supplier assigned to users" });
    }

    await Supplier.findByIdAndDelete({ _id :team._id});

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    logger.error("Delete Supplier Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
