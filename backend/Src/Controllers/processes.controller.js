import Process from "../Models/processes.models.js";
import logger from "../../Config/logger.js";

// =========================
// CREATE process
// =========================
export const createProcess = async (req, res) => {
  try {
    const processName = req.body.processName.trim().toLowerCase();

    const existing = await Process.findOne({ processName });
    if (existing) {
      return res.status(409).json({ message: "Process already exists" });
    }

    const process = await Process.create({ processName });
    const newprocess = {processCode:process.processCode, processName:process.processName};

    res.status(201).json({ message: "Process created successfully", process:newprocess });

  } catch (error) {
    logger.error("Create Process Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// GET ALL processS
// =========================
export const getProcesses = async (req, res) => {
  try {
    const processes = await Process.find({},{ __v: 0, createdAt: 0, updatedAt: 0, _id:0}).lean();
    res.status(200).json({
      message:"All Processs fetched Successfully",
      processes,
    });
  } catch (error) {
    logger.error("Get Processs Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// UPDATE process
// =========================
export const updateProcess = async (req, res) => {
  try {
    const processName = req.body.processName.trim().toLowerCase();
    const processCode = req.params.processCode;

    // Check duplicate (exclude current process)
    const existingprocess = await Process.findOne({
      processName,
      processCode: { $ne: processCode },
    });

    if (existingprocess) {
      return res
        .status(409)
        .json({ message: "Process name already exists" });
    }

    // Update
    const process = await Process.findOneAndUpdate(
      {processCode},
      { processName },
      { new: true, runValidators: true }
    );

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    res.status(200).json({
      message: "Process updated successfully",
      process,
    });

  } catch (error) {
    logger.error("Update Process Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// DELETE process
// =========================
export const deleteProcess = async (req, res) => {
  try {
    const process = await Process.findOneAndDelete(req.params.processCode);
    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    res.status(200).json({ message: "Process deleted successfully" });
  } catch (error) {
    logger.error("Delete Process Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
