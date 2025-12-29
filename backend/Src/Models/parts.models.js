import mongoose from "mongoose";
import { randomUUID } from "crypto";

const partSchema = new mongoose.Schema(
  {
    // Stable public/business ID
    partCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    partName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// Auto-generate partCode once
partSchema.pre("save", function (next) {
  if (!this.partCode) {
    this.partCode = `PART-${randomUUID()}`;
  }
  next();
});

export default mongoose.model("Part", partSchema);
