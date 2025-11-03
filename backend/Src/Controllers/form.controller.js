import Form from "../Models/form.models.js";

export const modifyForm = async (req, res) => {
  try {
    const { formData, filledBy, status } = req.body;

    // Basic validation
    if (!formData) {
      return res.status(400).json({ message: "Form data is required" });
    }

    // Create new form document
    const newForm = new Form({
      formData,
      filledBy: filledBy || "quality",
      status: status || "pending_prod",
    });

    // Save to DB
    const savedForm = await newForm.save();

    return res.status(201).json({
      message: "Form submitted successfully",
      form: savedForm,
    });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({
      message: "Failed to submit form",
      error: error.message,
    });
  }
};

export const getAllForms = async (req, res) => {
  try {    
      const forms = await Form.find({ status: { $ne: "approved" } });

    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "No forms found" });
    }

    res.status(200).json({
      message: "Forms fetched successfully",
      count: forms.length,
      forms,
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({
      message: "Failed to fetch forms",
      error: error.message,
    });
  }
};

export const approveForm = async (req, res) => {
  try {
    const { formId } = req.body; 
console.log("formId",formId);
    // Find the form and update its status to "approved"
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { status: "approved", updatedAt: new Date() },
      { new: true } // return the updated document
    );
    console.log(updatedForm);
    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({
      message: "Form approved successfully",
      form: updatedForm,
    });
  } catch (error) {
    console.error("Error approving form:", error);
    res.status(500).json({
      message: "Failed to approve form",
      error: error.message,
    });
  }
};
