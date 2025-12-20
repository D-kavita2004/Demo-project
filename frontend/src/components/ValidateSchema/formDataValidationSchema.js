import { z } from "zod";

// Reusable date validator (YYYY-MM-DD)
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

// Reusable non-empty string validator
const nonEmpty = z.string().trim().min(1, "This field cannot be empty");

export const formDataSchema = z
  .object({
    // ========== Issuing Section ==========
    receivingNo: nonEmpty.regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers and hyphens allowed"),
    referenceNo: nonEmpty.regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers and hyphens allowed"),
    partName: nonEmpty,
    subjectMatter: nonEmpty,
    approved: nonEmpty,
    checked: nonEmpty,
    issued: nonEmpty,

    // ========== Defectiveness Detail ==========
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

    // ========== Quality Check Comment ==========
    qcComment: nonEmpty,
    // approvalStatus: nonEmpty,
    // checkedByQC: nonEmpty,
    qcInstructions: nonEmpty,
    defectCost: z.coerce.number().min(0),
    unit: nonEmpty,
    // occurrenceSection: nonEmpty,
    importanceLevel: z.enum(["AA", "A", "B", "C"]),
    reportTimeLimit: dateString,

    // ========== Measures Report ==========
    // measuresReport: nonEmpty,
    // responsibleSection: nonEmpty,
    causesOfOccurrence: nonEmpty,
    causesOfOutflow: nonEmpty,
    counterMeasuresForCauses: nonEmpty,
    counterMeasuresForOutflow: nonEmpty,
    enforcementDate: dateString,
    standardization: nonEmpty,

    // ========== Results of Measures ==========
    enforcementDateResult: dateString,
    enforcementResult: nonEmpty,
    enforcementJudgment: nonEmpty,
    enforcementSecInCharge: nonEmpty,
    enforcementQCSection: nonEmpty,
    // enforcementApproved: z.boolean(),

    effectDate: dateString,
    effectResult: nonEmpty,
    effectJudgment: nonEmpty,
    effectSecInCharge: nonEmpty,
    effectQCSection: nonEmpty,
    // effectApproved: z.boolean(),
  })

  // ========== Cross-field validations ==========

  // Used quantity should not exceed totalQuantity
  .refine((data) => data.usedQuantity <= data.totalQuantity, {
    message: "Used quantity cannot exceed total quantity",
    path: ["usedQuantity"], // FIELD LEVEL ERROR
  })

  // Residual = total - used
  .refine((data) => data.residualQuantity === data.totalQuantity - data.usedQuantity, {
    message: "Residual quantity should be totalQuantity - usedQuantity",
    path: ["residualQuantity"], // FIELD LEVEL ERROR
  })

  // Issue date ≥ discovered date
  .refine((data) => new Date(data.discoveredDate) <= new Date(data.issueDate), {
    message: "Issue date cannot be earlier than discovered date",
    path: ["issueDate"], // FIELD LEVEL ERROR
  })

  // enforcementDateResult ≥ enforcementDate
  .refine((data) => new Date(data.enforcementDate) <= new Date(data.enforcementDateResult), {
    message: "Measure result date must be on or after enforcement date",
    path: ["enforcementDateResult"], // FIELD LEVEL ERROR
  })

  // effectDate ≥ enforcementDateResult
  .refine((data) => new Date(data.enforcementDateResult) <= new Date(data.effectDate), {
    message: "Effect date cannot be earlier than enforcement result date",
    path: ["effectDate"], // FIELD LEVEL ERROR
  });
