import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    partName:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Part", partSchema);
