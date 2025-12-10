import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplierName:{
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Supplier", supplierSchema);
