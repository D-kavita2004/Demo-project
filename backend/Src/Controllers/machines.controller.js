import Machine from "../Models/machines.models.js";
import logger from "../../Config/logger.js";

// =========================
// CREATE machine
// =========================
export const createMachine = async (req, res) => {
  try {
    const machineName = req.body.machineName.trim().toLowerCase();

    const existing = await Machine.findOne({ machineName });
    if (existing) {
      return res.status(409).json({ message: "Machine already exists" });
    }

    const machine = await Machine.create({ machineName });
    const newmachine = {machineCode:machine.machineCode, machineName:machine.machineName};

    res.status(201).json({ message: "Machine created successfully", machine:newmachine });

  } catch (error) {
    logger.error("Create Machine Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// GET ALL machineS
// =========================
export const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find({},{ __v: 0, createdAt: 0, updatedAt: 0,_id:0}).lean();
    res.status(200).json({
      message:"All Machines fetched Successfully",
      machines,
    });
  } catch (error) {
    logger.error("Get Machines Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// UPDATE machine
// =========================
export const updateMachine = async (req, res) => {
  try {
    const machineName = req.body.machineName.trim().toLowerCase();
    const machineCode = req.params.machineCode;

    // Check duplicate (exclude current machine)
    const existingmachine = await Machine.findOne({
      machineName,
      machineCode: { $ne: machineCode },
    });

    if (existingmachine) {
      return res
        .status(409)
        .json({ message: "Machine name already exists" });
    }

    // Update
    const machine = await Machine.findOneAndUpdate(
      {machineCode},
      { machineName },
      { new: true, runValidators: true },
    );

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    res.status(200).json({
      message: "Machine updated successfully",
      machine,
    });

  } catch (error) {
    logger.error("Update Machine Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================
// DELETE machine
// =========================
export const deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findOneAndDelete(req.params.machineCode);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    res.status(200).json({ message: "Machine deleted successfully" });
  } catch (error) {
    logger.error("Delete Machine Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
