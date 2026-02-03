import Form from "../Models/form.models.js";

export const generateReceivingNo = async () => {
  const year = new Date().getFullYear().toString().slice(-2);

  // Find last created form
  const lastForm = await Form.findOne(
    { "formData.issuingSection.receivingNo": { $regex: `^DIN-${year}-` } },
    { "formData.issuingSection.receivingNo": 1 }
  ).sort({ createdAt: -1 });

  let nextSequence = 1;

  if (lastForm?.formData?.issuingSection?.receivingNo) {
    const lastNo = lastForm.formData.issuingSection.receivingNo;
    const lastSequence = parseInt(lastNo.split("-")[2], 10);
    nextSequence = lastSequence + 1;
  }

  const sequence = nextSequence.toString().padStart(3, "0");
  return `DIN-${year}-${sequence}`;
};
