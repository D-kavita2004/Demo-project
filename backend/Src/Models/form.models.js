import mongoose from "mongoose";

/* ===================== HISTORY ===================== */
const historySchema = new mongoose.Schema(
  {
    cycle: {
      type: Number,
      required: true,
    },
    data: {
      measuresReport: { type: mongoose.Schema.Types.Mixed },
      resultsOfMeasuresEnforcement: { type: mongoose.Schema.Types.Mixed }
    },
  },
);

/* ===================== FORM DATA ===================== */
const formDataSchema = new mongoose.Schema(
  {
    /* ---------- Issuing Section ---------- */
    issuingSection: {
      receivingNo: { type: String },
      referenceNo: { type: String },
      part: { type: String},
      subjectMatter: { type: String},
      approved: { type: String },
      checked: { type: String },
      issued: { type: String },
    },

    /* ---------- Defectiveness Detail ---------- */
    defectivenessDetail: {
      supplier: { type: String },
      groupName: { type: String },
      stateOfProcess: { type: String },
      associatedLotNo: { type: String },
      discoveredDate: { type: String }, // YYYY-MM-DD
      issueDate: { type: String },      // YYYY-MM-DD
      orderNo: { type: String },
      drawingNo: { type: String },
      process: { type: String },
      machine: { type: String },

      totalQuantity: { type: Number },
      usedQuantity: { type: Number },
      residualQuantity: { type: Number },
      defectRate: { type: Number },

      managerInstructions: { type: String },
      productImage: { type: String }, // stored file path
    },

    /* ---------- Quality Check Comment ---------- */
    qualityCheckComment: {
      qcComment: { type: String },
      qcInstructions: { type: String },
      defectCost: { type: Number },
      unit: { type: String },
      importanceLevel: {
        type: String,
        enum: ["AA", "A", "B", "C"],
      },
      reportTimeLimit: { type: String }, // YYYY-MM-DD
    },

    /* ---------- Measures Report ---------- */
    measuresReport: {
      causesOfOccurrence: { type: String },
      causesOfOutflow: { type: String },
      counterMeasuresForCauses: { type: String },
      counterMeasuresForOutflow: { type: String },
      enforcementDate: { type: String }, // YYYY-MM-DD
      standardization: { type: String },
      prodFile: { type: String },
    },

    /* ---------- Results of Measures ---------- */
    resultsOfMeasuresEnforcement: {
      enforcementDateResult: { type: String },
      enforcementResult: { type: String },
      enforcementJudgment: { type: String },
      enforcementSecInCharge: { type: String },
      enforcementQCSection: { type: String },
    },

    /* ---------- Results of Measures ---------- */
    resultsOfMeasuresEffect: {
      effectDate: { type: String },
      effectResult: { type: String },
      effectJudgment: { type: String },
      effectSecInCharge: { type: String },
      effectQCSection: { type: String },
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
      enum: ["pending_prod", "pending_quality", "approved", "finished"],
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
