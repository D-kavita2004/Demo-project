import Form from "../Models/form.models.js";
import logger from "../../Config/logger.js";

export const generateReceivingNo = async () => {
  try {
    const year = new Date().getFullYear().toString().slice(-2);

    // Find last created form for this year
    const lastForm = await Form.findOne(
      { "formData.issuingSection.receivingNo": { $regex: `^DIN-${year}-` } },
      { "formData.issuingSection.receivingNo": 1 },
    ).sort({ createdAt: -1 });

    let nextSequence = 1;

    if (lastForm?.formData?.issuingSection?.receivingNo) {
      const lastNo = lastForm.formData.issuingSection.receivingNo;
      const parts = lastNo.split("-");

      if (parts.length !== 3 || isNaN(parseInt(parts[2], 10))) {
        logger.error(`Invalid receivingNo format in last form: ${lastNo}`);
        return;
      }

      const lastSequence = parseInt(parts[2], 10);
      nextSequence = lastSequence + 1;
    }

    const sequence = nextSequence.toString().padStart(3, "0");
    return `DIN-${year}-${sequence}`;
  } catch (error) {
    logger.error("Error generating receiving number:", error);
    throw new Error("Failed to generate receiving number");
  }
};
