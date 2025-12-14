import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    machineName:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Machine", machineSchema);
