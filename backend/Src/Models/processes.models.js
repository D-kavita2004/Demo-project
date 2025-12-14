import mongoose from "mongoose";

const processSchema = new mongoose.Schema(
  {
    processName:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Process", processSchema);
