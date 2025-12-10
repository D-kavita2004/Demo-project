import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    formData: { type: mongoose.Schema.Types.Mixed, required: true },
    filledBy: { type: String, enum: ["Quality", "Production"], default: "Quality" },
    status: { 
      type: String, 
      enum: ["pending_prod", "pending_quality", "approved"],
      default: "pending_prod", 
    },
  },
  { timestamps: true }, // automatically adds createdAt and updatedAt
);

const Form = mongoose.model("Form", formSchema);
export default Form;
