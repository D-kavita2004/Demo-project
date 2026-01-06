import Form from "../Models/form.models.js";
import logger from "../../Config/logger.js";

// Creating new form issue
export const createNewIssue = async(req, res) => {                
  try {
    const {team} = req.user;

    const imageUrl = req.fileUrl;
    
    let data = {};
    if (req.body.data) {
      data = JSON.parse(req.body.data);
    };
    logger.info(JSON.stringify(data, null, 2));

    if (!data) {
      return res.status(404).json({ message: "Form data is required" });
    }

    let form;

    if(team.flag === "QA"){
      form = new Form({
        formData: {
          issuingSection: data.issuingSection, 
          defectivenessDetail: {...data.defectivenessDetail, productImage: imageUrl},
          qualityCheckComment:data.qualityCheckComment },
        status: "pending_prod",
      });

      await form.save();
    }else{
      return res.status(403).json({
        message: "Only Quality team can submit new forms",
      });
    }

    return res.status(201).json({
      message:"Form submitted successfully",
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

// handle response by production team
export const handleProdResponse = async (req, res) => {
  try {
    const { team } = req.user;
    const { formId } = req.body;

    let data = {};
    if (req.body.data) {
      data = req.body.data;
    }
    logger.info(JSON.stringify(data, null, 2));
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (team.flag !== "INTERNAL") {
      return res.status(403).json({
        message: "Only Production team can submit measures report",
      });
    }

    // merge into existing formData safely
    form.formData = {
      ...form.formData,
      measuresReport: data.measuresReport,
    };

    form.status = "pending_quality";
    form.updatedAt = new Date();

    await form.save();

    return res.status(200).json({
      message: "Production response submitted successfully",
      form,
    });
  } catch (error) {
    logger.error("Error handling production response:", error);
    return res.status(500).json({
      message: "Failed to handle production response",
      error: error.message,
    });
  }
};

// handle approval of form by Quality team 
export const handleApprove = async (req, res) => {
  try {
    const { formId } = req.body;
    const { team } = req.user;

    let data = {};
    if (req.body.data) {
      data = req.body.data;
    }

    if (team.flag !== "QA") {
      return res.status(403).json({
        message: "Only Quality team can approve forms",
      });
    }

    if (!formId) {
      return res.status(400).json({ message: "Form ID is required" });
    }

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // merge QA section safely
    form.formData = {
      ...form.formData,
      resultsOfMeasuresEnforcement: data.resultsOfMeasuresEnforcement,
    };

    form.status = "approved";
    form.updatedAt = new Date();

    await form.save();

    return res.status(200).json({
      message: "Form approved successfully",
      form,
    });

  } catch (error) {
    logger.error("Error handling approval:", error);
    return res.status(500).json({
      message: "Failed to handle approval",
      error: error.message,
    });
  }
};

// handle rejection of form by Quality team
export const handleReject = async (req, res) => {
  try {
    const { formId } = req.body;
    const { team } = req.user;

    let data = {};
    if (req.body.data) {
      data = req.body.data;
    }

    if (team.flag !== "QA") {
      return res.status(403).json({
        message: "Only Quality team can reject forms",
      });
    }

    if (!formId) {
      return res.status(400).json({ message: "Form ID is required" });
    }

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // const formData = form.formData;

    // Compute next cycle number
    const lastCycle = form.history.length
      ? form.history[form.history.length - 1].cycle
      : 0;

    const nextCycle = lastCycle + 1;

    // Push history entry
    form.history.push({
      cycle: nextCycle,
      data: {
        measuresReport: form.formData.measuresReport, //data from db
        resultsOfMeasuresEnforcement: data.resultsOfMeasuresEnforcement, // input from user
      },
    });
    form.formData = {...form.formData, resultsOfMeasuresEnforcement: data.resultsOfMeasuresEnforcement };
    form.status = "pending_prod";

    //Save changes
    await form.save();

    return res.status(200).json({
      message: "Form rejected successfully",
      form,
    });
    
  } catch (error) {
    logger.error("Error handling rejection:", error);

    return res.status(500).json({
      message: "Failed to handle rejection",
      error: error.message,
    });
  }
};

// handle final submission and ending the workflow
export const handleFinalSubmit = async(req, res) => {
  try {
    const { formId } = req.body; 
    const team = req.user.team;

    let data = {};
    if (req.body.data) {
      data = req.body.data;
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if(form.status !== "approved" || (team.flag !== "QA" && team.flag !== "IT")){
      return res.status(400).json({
        message: "Only approved forms can be finalized",
      });
    }
    
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { formData: {...form.formData, resultsOfMeasuresEffect: data.resultsOfMeasuresEffect },
        status: "finished", updatedAt: new Date() },
      { new: true }, // return the updated document
    );
    //     console.log(updatedForm);
    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({
      message: "Form workflow finished successfully",
      form: updatedForm,
    });
  } catch (error) {
    logger.error("Error while ending the workflow", error);
    res.status(500).json({
      message: "Failed to end the workflow",
      error: error.message,
    });
  }
};

// get all forms with role-based access
export const getAllForms = async (req, res) => {
  try {
    const { role, team} = req.user; // get from auth middleware

    const filter =
      team.flag === "QA" || role === "admin" || team.flag === "IT"
        ? {}
        : team.flag === "INTERNAL"
          ? { "formData.defectivenessDetail.supplier": team.supplierCode }
          : {};

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
