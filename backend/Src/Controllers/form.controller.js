import Form from "../Models/form.models.js";
import logger from "../../Config/logger.js";
// import Supplier from "../Models/suppliers.models.js";
// import Part from "../Models/parts.models.js";
// import Process from "../Models/processes.models.js";
// import Machine from "../Models/machines.models.js";


export const modifyForm = async (req, res) => {
  try {
    // console.log("modify function hit")
    const { formId,status } = req.body;
    const imageUrl = req.fileUrl;
    
    let formData = {};
    if (req.body.formData) {
      formData = JSON.parse(req.body.formData);
    }
    logger.info(JSON.stringify(formData, null, 2));

    if (!formData) {
      return res.status(404).json({ message: "Form data is required" });
    }

    let form;

    if (formId) {
      // Update existing form
      form = await Form.findByIdAndUpdate(
        formId,
        {
          formData: {...formData, defectivenessDetail: {...formData.defectivenessDetail, productImage: imageUrl}  },
          status: status || "pending_prod",
          updatedAt: new Date(),
        },
        { new: true },
      );
    } else {
      // Create new form
      form = new Form({
        formData: {...formData, defectivenessDetail: {...formData.defectivenessDetail, productImage: imageUrl}  },
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
    const { role} = req.user; // get from auth middleware
    const team = req.body;
    const filter =
      team === "QA" || role === "admin"
        ? {}
        : { status: { $ne: "approved" } };

    const forms = await Form.find(filter)
      .populate({
        path: "formData.issuingSection.part",   // local field in Form
        model: "Part",                              // referenced model
        foreignField: "partCode",                   // field in Part to match
        select: "partCode partName -_id",                // fields to return
        justOne: true,                            // optional if one-to-one
      })
      .populate({
        path: "formData.defectivenessDetail.process",
        model: "Process",
        foreignField: "processCode",
        select: "processCode processName -_id",
        justOne: true,
      })
      .populate({
        path: "formData.defectivenessDetail.supplier",
        model: "Supplier",
        foreignField: "supplierCode",
        select: "supplierCode supplierName -_id",
        justOne: true,
      })
      .populate({
        path: "formData.defectivenessDetail.machine",
        model: "Machine",
        foreignField: "machineCode",
        select: "machineCode machineName -_id",
        justOne: true,
      })
      .lean();

    if (!forms.length) {
      return res.status(200).json({
        message: "No forms found",
        count: 0,
        forms: [],
      });
    }

    return res.status(200).json({
      message: "Forms fetched successfully",
      count: forms.length,
      forms,
    });
  }
  catch(error){
    logger.error("Error fetching forms:", error);
    return res.status(500).json({
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