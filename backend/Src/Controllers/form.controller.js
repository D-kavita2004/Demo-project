import Form from "../Models/form.models.js";
import logger from "../../Config/logger.js";

export const modifyForm = async (req, res) => {
  try {
    // console.log("modify function hit")
    const { formId, formData, filledBy, status, imageUrl } = req.body;
    // console.log(imageUrl);

    if (!formData) {
      return res.status(400).json({ message: "Form data is required" });
    }

    let form;

    if (formId) {
      // Update existing form
      form = await Form.findByIdAndUpdate(
        formId,
        {
          formData,
          imageUrl,
          filledBy: filledBy || "Quality",
          status: status || "pending_prod",
          updatedAt: new Date(),
        },
        { new: true },
      );
    } else {
      // Create new form
      form = new Form({
        formData,
        imageUrl,
        filledBy: filledBy || "Quality",
        status: status || "pending_prod",
      });
      await form.save();
    }

    return res.status(201).json({
      message: formId ? "Form updated successfully" : "Form submitted successfully",
      form,
    });
  } catch (error) {
    logger.error("Error saving form:", error);
    res.status(500).json({
      message: "Failed to submit form",
      error: error.message,
    });
  }
};

export const getAllForms = async (req, res) => {
  try {    
    const {Team} = req.body;
    let forms;

    if(Team === "Quality"){
      forms = await Form.find({});
    }
    else{
      forms = await Form.find({ status: { $ne: "approved" } });
    }

    if (!forms || forms.length === 0) {
      return res.status(201).json({ message: "No forms found" });
    }

    res.status(200).json({
      message: "Forms fetched successfully",
      count: forms.length,
      forms,
    });
  } catch (error) {
    logger.error("Error fetching forms:", error);
    res.status(500).json({
      message: "Failed to fetch forms",
      error: error.message,
    });
  }
};

export const approveForm = async (req, res) => {
  try {
    const { formId } = req.body; 
    // console.log("formId",formId);
    // Find the form and update its status to "approved"
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { status: "approved", updatedAt: new Date() },
      { new: true }, // return the updated document
    );
    //     console.log(updatedForm);
    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({
      message: "Form approved successfully",
      form: updatedForm,
    });
  } catch (error) {
    logger.error("Error approving form:", error);
    res.status(500).json({
      message: "Failed to approve form",
      error: error.message,
    });
  }
};