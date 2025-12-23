import { z } from "zod";

// Reusable date validator (YYYY-MM-DD)
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

// Reusable non-empty string validator
const nonEmpty = z.string().trim().min(1, "This field cannot be empty");

export const formDataSchema = z.object({
  // ========== Issuing Section ==========
  issuingSection: z.object({
    receivingNo: nonEmpty.regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers and hyphens allowed"),
    referenceNo: nonEmpty.regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers and hyphens allowed"),
    partName: nonEmpty,
    subjectMatter: nonEmpty,
    approved: nonEmpty,
    checked: nonEmpty,
    issued: nonEmpty,
  }),

  // ========== Defectiveness Detail ==========
  defectivenessDetail: z.object({
    supplierName: nonEmpty,
    groupName: nonEmpty,
    stateOfProcess: nonEmpty,
    associatedLotNo: nonEmpty,
    discoveredDate: dateString,
    issueDate: dateString,
    orderNo: z.string().trim().optional(),
    drawingNo: z.string().trim().optional(),
    processName: nonEmpty,
    machineName: nonEmpty,
    totalQuantity: z.coerce.number().int().min(1, "Must be at least 1"),
    usedQuantity: z.coerce.number().int().min(0),
    residualQuantity: z.coerce.number().int().min(0),
    defectRate: z.coerce.number().min(0).max(100).optional(),
    managerInstructions: nonEmpty,
    productImage: z.any().optional(),
  }),

  // ========== Quality Check Comment ==========
  qualityCheckComment: z.object({
    qcComment: nonEmpty,
    qcInstructions: nonEmpty,
    defectCost: z.coerce.number().min(0),
    unit: nonEmpty,
    importanceLevel: z.enum(["AA", "A", "B", "C"]),
    reportTimeLimit: dateString,
  }),

  // ========== Measures Report ==========
  measuresReport: z.object({
    causesOfOccurrence: nonEmpty,
    causesOfOutflow: nonEmpty,
    counterMeasuresForCauses: nonEmpty,
    counterMeasuresForOutflow: nonEmpty,
    enforcementDate: dateString,
    standardization: nonEmpty,
  }),

  // ========== Results of Measures ==========
  resultsOfMeasures: z.object({
    enforcementDateResult: dateString,
    enforcementResult: nonEmpty,
    enforcementJudgment: nonEmpty,
    enforcementSecInCharge: nonEmpty,
    enforcementQCSection: nonEmpty,
    effectDate: dateString,
    effectResult: nonEmpty,
    effectJudgment: nonEmpty,
    effectSecInCharge: nonEmpty,
    effectQCSection: nonEmpty,
  }),
})
  // ========== Cross-field validations ==========
  .refine(
    (data) => data.defectivenessDetail.usedQuantity <= data.defectivenessDetail.totalQuantity,
    {
      message: "Used quantity cannot exceed total quantity",
      path: ["defectivenessDetail", "usedQuantity"],
    }
  )
  .refine(
    (data) =>
      data.defectivenessDetail.residualQuantity ===
      data.defectivenessDetail.totalQuantity - data.defectivenessDetail.usedQuantity,
    {
      message: "Residual quantity should be totalQuantity - usedQuantity",
      path: ["defectivenessDetail", "residualQuantity"],
    }
  )
  .refine(
    (data) =>
      new Date(data.defectivenessDetail.discoveredDate) <=
      new Date(data.defectivenessDetail.issueDate),
    {
      message: "Issue date cannot be earlier than discovered date",
      path: ["defectivenessDetail", "issueDate"],
    }
  )
  .refine(
    (data) =>
      new Date(data.measuresReport.enforcementDate) <=
      new Date(data.resultsOfMeasures.enforcementDateResult),
    {
      message: "Measure result date must be on or after enforcement date",
      path: ["resultsOfMeasures", "enforcementDateResult"],
    }
  )
  .refine(
    (data) =>
      new Date(data.resultsOfMeasures.enforcementDateResult) <=
      new Date(data.resultsOfMeasures.effectDate),
    {
      message: "Effect date cannot be earlier than enforcement result date",
      path: ["resultsOfMeasures", "effectDate"],
    }
  );
