import mongoose from "mongoose";
import { randomUUID } from "crypto";

const processSchema = new mongoose.Schema(
  {
    // Stable public/business ID
    processCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    processName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// Auto-generate processCode once
processSchema.pre("save", function (next) {
  if (!this.processCode) {
    this.processCode = `PROC-${randomUUID()}`;
  }
  next();
});

export default mongoose.model("Process", processSchema);
