import mongoose from "mongoose";

/* ===================== HISTORY ===================== */
const historySchema = new mongoose.Schema(
  {
    cycle: {
      type: Number,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
);

/* ===================== FORM DATA ===================== */
const formDataSchema = new mongoose.Schema(
  {
    /* ---------- Issuing Section ---------- */
    issuingSection: {
      receivingNo: { type: String, required: true },
      referenceNo: { type: String, required: true },
      partName: { type: mongoose.Schema.Types.ObjectId, ref: "Part", required: true },
      subjectMatter: { type: String, required: true },
      approved: { type: String, required: true },
      checked: { type: String, required: true },
      issued: { type: String, required: true },
    },

    /* ---------- Defectiveness Detail ---------- */
    defectivenessDetail: {
      supplierName: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
      groupName: { type: String, required: true },
      stateOfProcess: { type: String, required: true },
      associatedLotNo: { type: String, required: true },
      discoveredDate: { type: String, required: true }, // YYYY-MM-DD
      issueDate: { type: String, required: true },      // YYYY-MM-DD
      orderNo: { type: String },
      drawingNo: { type: String },
      processName: { type: mongoose.Schema.Types.ObjectId, ref: "Process", required: true },
      machineName: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },

      totalQuantity: { type: Number, required: true },
      usedQuantity: { type: Number, required: true },
      residualQuantity: { type: Number, required: true },
      defectRate: { type: Number },

      managerInstructions: { type: String, required: true },
      productImage: { type: String }, // stored file path
    },

    /* ---------- Quality Check Comment ---------- */
    qualityCheckComment: {
      qcComment: { type: String, required: true },
      qcInstructions: { type: String, required: true },
      defectCost: { type: Number, required: true },
      unit: { type: String, required: true },
      importanceLevel: {
        type: String,
        enum: ["AA", "A", "B", "C"],
        required: true,
      },
      reportTimeLimit: { type: String, required: true }, // YYYY-MM-DD
    },

    /* ---------- Measures Report ---------- */
    measuresReport: {
      causesOfOccurrence: { type: String, required: true },
      causesOfOutflow: { type: String, required: true },
      counterMeasuresForCauses: { type: String, required: true },
      counterMeasuresForOutflow: { type: String, required: true },
      enforcementDate: { type: String, required: true }, // YYYY-MM-DD
      standardization: { type: String, required: true },
    },

    /* ---------- Results of Measures ---------- */
    resultsOfMeasures: {
      enforcementDateResult: { type: String, required: true },
      enforcementResult: { type: String, required: true },
      enforcementJudgment: { type: String, required: true },
      enforcementSecInCharge: { type: String, required: true },
      enforcementQCSection: { type: String, required: true },
      effectDate: { type: String, required: true },
      effectResult: { type: String, required: true },
      effectJudgment: { type: String, required: true },
      effectSecInCharge: { type: String, required: true },
      effectQCSection: { type: String, required: true },
    },
  },
);

/* ===================== MAIN FORM ===================== */
const formSchema = new mongoose.Schema(
  {
    formData: {
      type: formDataSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending_prod", "pending_quality", "approved"],
      default: "pending_prod",
    },

    history: {
      type: [historySchema],
      default: [],
    },
  },
  { timestamps: true },
);

const Form = mongoose.model("Form", formSchema);
export default Form;
