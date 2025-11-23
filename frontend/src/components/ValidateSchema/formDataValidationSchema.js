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
    receivingNo: nonEmpty.regex(
      /^[A-Z0-9-]+$/,
      "Only uppercase letters, numbers and hyphens allowed"
    ),
    referenceNo: nonEmpty.regex(
      /^[A-Z0-9-]+$/,
      "Only uppercase letters, numbers and hyphens allowed"
    ),
    partName: nonEmpty,
    subjectMatter: nonEmpty,
    approved: nonEmpty,
    checked: nonEmpty,
    issued: nonEmpty,

    // ========== Defectiveness Detail ==========
    supplierName: nonEmpty,
    groupName: nonEmpty,
    stateOfProcess: nonEmpty,
    associatedLotNo: nonEmpty.regex(
      /^[A-Z0-9-]+$/,
      "Only uppercase letters, numbers and hyphens allowed"
    ),
    discoveredDate: dateString,
    issueDate: dateString,
    orderNo: nonEmpty.regex(
      /^[A-Z0-9-]+$/,
      "Only uppercase letters, numbers and hyphens allowed"
    ),
    drawingNo: nonEmpty.regex(
      /^[A-Z0-9-]+$/,
      "Only uppercase letters, numbers and hyphens allowed"
    ),
    processName: nonEmpty,
    machineName: nonEmpty,

    totalQuantity: z.coerce.number().int().min(1, "Must be at least 1"),
    usedQuantity: z.coerce.number().int().min(0),
    residualQuantity: z.coerce.number().int().min(0),

    defectRate: z.coerce.number().min(0).max(100),

    managerInstructions: nonEmpty,
    productImage: z.any().optional(),

    // ========== Quality Check Comment ==========
    qcComment: nonEmpty,
    approvalStatus: nonEmpty,
    checkedByQC: nonEmpty,
    qcInstructions: nonEmpty,
    defectCost: z.coerce.number().min(0),
    unit: nonEmpty,
    occurrenceSection: nonEmpty,
    importanceLevel: z.enum(["AA","A", "B", "C"]), // common rating scale
    reportTimeLimit: dateString,

    // ========== Measures Report ==========
    measuresReport: nonEmpty,
    responsibleSection: nonEmpty,
    causeDetails: nonEmpty,
    countermeasures: nonEmpty,
    enforcementDate: dateString,
    standardization: nonEmpty,

    // ========== Results of Measures ==========
    enforcementDateResult: dateString,
    enforcementResult: nonEmpty,
    enforcementJudgment: nonEmpty,
    enforcementSecInCharge: nonEmpty,
    enforcementQCSection: nonEmpty,
    enforcementApproved: z.boolean(),

    effectDate: dateString,
    effectResult: nonEmpty,
    effectJudgment: nonEmpty,
    effectSecInCharge: nonEmpty,
    effectQCSection: nonEmpty,
    effectApproved: z.boolean(),
  })

  // ========== Cross-field validations ==========
  .refine(
    (data) => data.usedQuantity <= data.totalQuantity,
    "Used quantity cannot exceed total quantity"
  )
  .refine(
    (data) => data.residualQuantity === data.totalQuantity - data.usedQuantity,
    "Residual quantity should be totalQuantity - usedQuantity"
  )
  .refine(
    (data) => new Date(data.discoveredDate) <= new Date(data.issueDate),
    "Issue date cannot be earlier than discovered date"
  )
  .refine(
    (data) =>
      new Date(data.enforcementDate) <= new Date(data.enforcementDateResult),
    "Measure result date must be on or after enforcement date"
  )
  .refine(
    (data) => new Date(data.enforcementDateResult) <= new Date(data.effectDate),
    "Effect date cannot be earlier than enforcement result date"
  );
