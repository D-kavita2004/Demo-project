import mongoose from "mongoose";
import { randomUUID } from "crypto";

const supplierSchema = new mongoose.Schema(
  {
    // Stable business ID 
    supplierCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    supplierName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    flag:{
      type:String,
      required:true,
      trim:true,
      enum:["INTERNAL","EXTERNAL","QA","IT"],  // Internal means production here
      default:"INTERNAL",     
    },
  },
  { timestamps: true }
);

// Auto-generate supplierCode once
supplierSchema.pre("save", function (next) {
  if (!this.supplierCode) {
    this.supplierCode = `SUP-${randomUUID()}`;
  }
  next();
});

export default mongoose.model("Supplier", supplierSchema);
