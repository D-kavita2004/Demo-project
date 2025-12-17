import mongoose from "mongoose";
import { randomUUID } from "crypto";

const machineSchema = new mongoose.Schema(
  {
    // Stable public/business ID
    machineCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    machineName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Auto-generate machineCode once
machineSchema.pre("save", function (next) {
  if (!this.machineCode) {
    this.machineCode = `MAC-${randomUUID()}`;
  }
  next();
});

export default mongoose.model("Machine", machineSchema);
