import { z } from "zod";

// Reusable date validator (YYYY-MM-DD)
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

// Reusable non-empty string validator
const nonEmpty = z.string().trim().min(1, "This field cannot be empty");

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

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
    },
  )
  .refine(
    (data) =>
      new Date(data.defectivenessDetail.discoveredDate) <=
      new Date(data.defectivenessDetail.issueDate),
    {
      message: "Issue date cannot be earlier than discovered date",
      path: ["defectivenessDetail", "issueDate"],
    },
  )
  .refine(
    (data) => data.defectivenessDetail.usedQuantity <= data.defectivenessDetail.totalQuantity,
    {
      message: "Used quantity cannot exceed total quantity",
      path: ["defectivenessDetail", "usedQuantity"],
    },
  );

// ========== Measures Report ==========
export const ProdResponseSchema = z.object({
  measuresReport: z.object({
    causesOfOccurrence: nonEmpty,
    causesOfOutflow: nonEmpty,
    counterMeasuresForCauses: nonEmpty,
    counterMeasuresForOutflow: nonEmpty,
    enforcementDate: z
      .string()
      .refine((value) => {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today();
      }, {
        message: "Enforcement date cannot be in the past",
      }),
    standardization: nonEmpty,
    prodFile:z.any().optional(),
  }),
});

// ========== Results of Measures Enforcement ==========
export const QAResponseSchema = z.object({
  resultsOfMeasuresEnforcement: z.object({
    enforcementDateResult:  z
      .string()
      .refine((value) => {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today();
      }, {
        message: "Enforcement date cannot be in the past",
      }),
    enforcementResult: nonEmpty,
    enforcementJudgment: nonEmpty,
    enforcementSecInCharge: nonEmpty,
    enforcementQCSection: nonEmpty,
  }),
});

// ========== Results of Measures Effect ==========
export const FinalResponseSchema = z.object({
  // ========== Results of Measures Effect ==========
  resultsOfMeasuresEffect: z.object({
    effectDate:  z
      .string()
      .refine((value) => {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today();
      }, {
        message: "Enforcement date cannot be in the past",
      }),
    effectResult: nonEmpty,
    effectJudgment: nonEmpty,
    effectSecInCharge: nonEmpty,
    effectQCSection: nonEmpty,
  }),
});

// To handle cases where no validation is needed
export const EmptySchema = z.object({});