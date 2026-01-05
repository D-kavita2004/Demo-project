import { z } from "zod";

// Reusable date validator (YYYY-MM-DD)
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

// Reusable non-empty string validator
const nonEmpty = z.string().trim().min(1, "This field cannot be empty");

// ========== New Form Schema ==========
export const NewFormSchema = z.object({
  // ========== Issuing Section ==========
  issuingSection: z.object({
    receivingNo: nonEmpty.regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers and hyphens allowed"),
    referenceNo: nonEmpty.regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers and hyphens allowed"),
    part: nonEmpty,
    subjectMatter: nonEmpty,
    approved: nonEmpty,
    checked: nonEmpty,
    issued: nonEmpty,
  }),

  // ========== Defectiveness Detail ==========
  defectivenessDetail: z.object({
    supplier: nonEmpty,
    groupName: nonEmpty,
    stateOfProcess: nonEmpty,
    associatedLotNo: nonEmpty,
    discoveredDate: dateString,
    issueDate: dateString,
    orderNo: z.string().trim().optional(),
    drawingNo: z.string().trim().optional(),
    process: nonEmpty,
    machine: nonEmpty,
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

})
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
    (data) => data.defectivenessDetail.usedQuantity <= data.defectivenessDetail.totalQuantity,
    {
      message: "Used quantity cannot exceed total quantity",
      path: ["defectivenessDetail", "usedQuantity"],
    }
  );

// ========== Measures Report ==========
export const ProdResponseSchema = z.object({
    // ========== Measures Report ==========
  measuresReport: z.object({
    causesOfOccurrence: nonEmpty,
    causesOfOutflow: nonEmpty,
    counterMeasuresForCauses: nonEmpty,
    counterMeasuresForOutflow: nonEmpty,
    enforcementDate: dateString,
    standardization: nonEmpty,
  }),
})

// ========== Results of Measures Enforcement ==========
export const QAResponseSchema = z.object({
    // ========== Results of Measures Enforcement ==========
  resultsOfMeasuresEnforcement: z.object({
    enforcementDateResult: dateString,
    enforcementResult: nonEmpty,
    enforcementJudgment: nonEmpty,
    enforcementSecInCharge: nonEmpty,
    enforcementQCSection: nonEmpty,
  }),
})

// ========== Results of Measures Effect ==========
export const FinalResponseSchema = z.object({
  // ========== Results of Measures Effect ==========
  resultsOfMeasuresEffect: z.object({
    effectDate: dateString,
    effectResult: nonEmpty,
    effectJudgment: nonEmpty,
    effectSecInCharge: nonEmpty,
    effectQCSection: nonEmpty,
  })
})