import Part from "../Models/parts.models.js";
import logger from "../../Config/logger.js";

// =========================
// CREATE part
// =========================
export const createPart = async (req, res) => {
  try {
    const partName = req.body.partName.trim().toLowerCase();

    const existing = await Part.findOne({ partName });
    if (existing) {
      return res.status(409).json({ message: "Part already exists" });
    }

    const part = await Part.create({ partName });
    const newpart = {_id:part._id, partName:part.partName};

    res.status(201).json({ message: "Part created successfully", part:newpart });

  } catch (error) {

    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// GET ALL partS
// =========================
export const getParts = async (req, res) => {
  try {
    const parts = await Part.find({},{ __v: 0, createdAt: 0, updatedAt: 0}).lean();
    res.status(200).json({
      message:"All Parts fetched Successfully",
      parts,
    });
  } catch (error) {
    logger.error("Get Parts Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// UPDATE part
// =========================
export const updatePart = async (req, res) => {
  try {
    const partName = req.body.partName.trim().toLowerCase();
    const partId = req.params.id;

    // Check duplicate (exclude current part)
    const existingpart = await Part.findOne({
      partName,
      _id: { $ne: partId },
    });

    if (existingpart) {
      return res
        .status(409)
        .json({ message: "Part name already exists" });
    }

    // Update
    const part = await Part.findByIdAndUpdate(
      partId,
      { partName },
      { new: true, runValidators: true }
    );

    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(200).json({
      message: "Part updated successfully",
      part,
    });

  } catch (error) {
    logger.error("Update part Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// DELETE part
// =========================
export const deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(200).json({ message: "Part deleted successfully" });
  } catch (error) {
    logger.error("Delete part Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
