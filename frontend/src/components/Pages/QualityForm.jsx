import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../Constants/userContext";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import myimg from "../Assets/image.png";
// import { useEffect } from "react";

const QualityForm = () => {

  const myData =  {
      // ========== Issuing Section ==========
      receivingNo: "RCV-2025-001",
      referenceNo: "REF-12345",
      partName: "Gear Assembly",
      subjectMatter: "Inspection Report",
      approved: "John Doe",
      checked: "Jane Smith",
      issued: "Production Team",

      // ========== Defectiveness Detail ==========
      supplierName: "ABC Components Ltd.",
      groupName: "Quality Group A",
      stateOfProcess: "Machining",
      associatedLotNo: "LOT-7789",
      discoveredDate: "2025-10-20",
      issueDate: "2025-10-22",
      orderNo: "ORD-9988",
      drawingNo: "DRW-5567",
      processName: "Turning",
      machineName: "CNC Lathe Machine",
      totalQuantity: 100,
      usedQuantity: 60,
      residualQuantity: 40,
      defectRate: 4.5,
      managerInstructions: "Isolate defective items and investigate cause.",
      productImage: "",

      // ========== Quality Check Comment ==========
      qcComment: "Checked and verified by QC team.",
      approvalStatus: "approved",
      checkedByQC: "Ravi Kumar",
      qcInstructions: "Proceed with 100% inspection for next batch.",
      defectCost: 250.75,
      unit: "piece",
      occurrenceSection: "Assembly Line 2",
      importanceLevel: "A",
      reportTimeLimit: "2025-11-10",

      // ========== Measures Report ==========
      measuresReport: "Replaced faulty parts and retrained staff.",
      responsibleSection: "Maintenance",
      causeDetails: "Improper clamping caused vibration defects.",
      countermeasures: "Added additional support; training conducted.",
      enforcementDate: "2025-10-25",
      standardization:
        "Updated SOP and shared learnings across all production lines.",

      // ========== Results of Measures ==========
      enforcementDateResult: "2025-10-28",
      enforcementResult: "Measures implemented successfully.",
      enforcementJudgment: "Effective",
      enforcementSecInCharge: "R&D Team",
      enforcementQCSection: "QC Section A",
      enforcementApproved: true,

      effectDate: "2025-11-01",
      effectResult: "No recurrence of issue detected.",
      effectJudgment: "Stable",
      effectSecInCharge: "Production",
      effectQCSection: "QC Section A",
      effectApproved: true,
    }
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const clickedForm = location.state?.data;
  const [preview, setPreview] = useState(clickedForm.imageUrl);
  const formFromState = clickedForm.formData; 
  const myDefaultData = formFromState || myData;
  // console.log(myDefaultData);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues:myDefaultData});

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("productImage", file);

  const res = await axios.post(`${apiUrl}/image/productImage`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  console.log("Response",res);
  return res.data.url; // backend returns file URL
};

const onSubmit = async (data) => {
  console.log("calling modify form api");

  try {
    let imageUrl = "";

    // Step 1: Upload image first if it exists
    if (data.productImage?.[0]) {
      imageUrl = await uploadImage(data.productImage[0]);
      console.log("Image uploaded, URL:", imageUrl);
    }

    // Step 2: Submit form with image URL
    const res = await axios.post(`${apiUrl}/form/modifyForm`, {
      formId: location.state?.data?._id,
      formData: data,
      imageUrl, // include uploaded image URL here
      filledBy: user.team,
      status: user.team === "Quality" ? "pending_prod" : "pending_quality",
    });

    console.log("Form submitted successfully:", res.data);
    navigate("/");
    // reset();
  } catch (err) {
    console.error("Error submitting form:", err);
  }
};

// Image preview handler
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  }
};


  const handleApprove = async (id) => {

    try {
      // Call the API to approve the form
      const response = await axios.post(
        `${apiUrl}/form/approveForm`,
        {formId:id},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form approved:", response.data);
      navigate("/");
      // Open modal after approval
      setIsOpen(true);
    } catch (error) {
      console.error("Error approving form:", error.response?.data || error.message);
    } 
  };

  return (
    <Card className="max-w-5xl mx-auto mt-8 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold text-center">
          Product Review Form
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-10 my-6">

          {/* ====================== ISSUING SECTION ====================== */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Issuing Section</h2>

            <div className="grid gap-6 md:grid-cols-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">

              {/* Receiving No. */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="receivingNo">Receiving No.</Label>
                <Input
                  id="receivingNo"
                  placeholder="Enter receiving number"
                  {...register("receivingNo", { required: "Receiving no. is required" })}
                />
                {errors.receivingNo && (
                  <p className="text-sm text-red-500">{errors.receivingNo.message}</p>
                )}
              </div>

              {/* Reference No. */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="referenceNo">Reference No.</Label>
                <Input
                  id="referenceNo"
                  placeholder="Enter reference number"
                  {...register("referenceNo", { required: "Reference no. is required" })}
                />
                {errors.referenceNo && (
                  <p className="text-sm text-red-500">{errors.referenceNo.message}</p>
                )}
              </div>

              {/* Part Name */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="partName">Part Name</Label>
                <Input
                  id="partName"
                  placeholder="Enter part name"
                  {...register("partName", { required: "Part Name is required" })}
                />
                {errors.partName && (
                  <p className="text-sm text-red-500">{errors.partName.message}</p>
                )}
              </div>

              {/* Subject Matter */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="subjectMatter">Subject Matter</Label>
                <Input
                  id="subjectMatter"
                  placeholder="Enter subject matter"
                  {...register("subjectMatter", { required: "Subject Matter is required" })}
                />
                {errors.subjectMatter && (
                  <p className="text-sm text-red-500">{errors.subjectMatter.message}</p>
                )}
              </div>

              {/* Approved */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="approved">Approved By</Label>
                <Input
                  id="approved"
                  placeholder="Enter approver name"
                  {...register("approved", { required: "Approved by is required" })}
                />
                {errors.approved && (
                  <p className="text-sm text-red-500">{errors.approved.message}</p>
                )}
              </div>

              {/* Checked */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="checked">Checked By</Label>
                <Input
                  id="checked"
                  placeholder="Enter checker name"
                  {...register("checked", { required: "Checked by is required" })}
                />
                {errors.checked && (
                  <p className="text-sm text-red-500">{errors.checked.message}</p>
                )}
              </div>

              {/* Issued */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="issued">Issued To</Label>
                <Input
                  id="issued"
                  placeholder="Enter receiver name"
                  {...register("issued", { required: "Issued to is required" })}
                />
                {errors.issued && (
                  <p className="text-sm text-red-500">{errors.issued.message}</p>
                )}
              </div>

            </div>
          </section>

          {/* ====================== DEFECTIVENESS DETAIL ====================== */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Defectiveness Detail</h2>

            <div className="grid gap-6 md:grid-cols-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">

              {/* Section / Supplier Name */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="supplierName">Section / Supplier Name</Label>
                <select
                  id="supplierName"
                  className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("supplierName", { required: "Section/Supplier name is required" })}
                >
                  <option value="">Select Section/Supplier</option>
                  <option value="Part Area">Part Area</option>
                  <option value="Final Assembly">Final Assembly</option>
                  <option value="Fit Area">Fit Area</option>
                </select>
                {errors.supplierName && (
                  <p className="text-sm text-red-500">{errors.supplierName.message}</p>
                )}
              </div>


              {/* Group Name */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  {...register("groupName", { required: "Group name is required" })}
                />
                {errors.groupName && (
                  <p className="text-sm text-red-500">{errors.groupName.message}</p>
                )}
              </div>

              {/* State of Process */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="stateOfProcess">State of Process</Label>
                <Input
                  id="stateOfProcess"
                  placeholder="Enter state of process"
                  {...register("stateOfProcess", { required: "State of process is required" })}
                />
                {errors.stateOfProcess && (
                  <p className="text-sm text-red-500">{errors.stateOfProcess.message}</p>
                )}
              </div>

              {/* Associated Lot No. */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="associatedLotNo">Associated Lot No.</Label>
                <Input
                  id="associatedLotNo"
                  placeholder="Enter associated lot number"
                  {...register("associatedLotNo", { required: "Associated Lot No. is required" })}
                />
                {errors.associatedLotNo && (
                  <p className="text-sm text-red-500">{errors.associatedLotNo.message}</p>
                )}
              </div>

              {/* Discovered Date */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="discoveredDate">Discovered Date</Label>
                <Input
                  id="discoveredDate"
                  type="date"
                  {...register("discoveredDate", { required: "Discovered date is required" })}
                />
                {errors.discoveredDate && (
                  <p className="text-sm text-red-500">{errors.discoveredDate.message}</p>
                )}
              </div>

              {/* Issue Date */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  {...register("issueDate", { required: "Issue date is required" })}
                />
                {errors.issueDate && (
                  <p className="text-sm text-red-500">{errors.issueDate.message}</p>
                )}
              </div>

              {/* Order No. / Lot No. */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="orderNo">Order No. / Lot No.</Label>
                <Input
                  id="orderNo"
                  placeholder="Enter order or lot number"
                  {...register("orderNo", { required: "Order No. / Lot No. is required" })}
                />
                {errors.orderNo && (
                  <p className="text-sm text-red-500">{errors.orderNo.message}</p>
                )}
              </div>

              {/* Drawing No. */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="drawingNo">Drawing No.</Label>
                <Input
                  id="drawingNo"
                  placeholder="Enter drawing number"
                  {...register("drawingNo", { required: "Drawing number is required" })}
                />
                {errors.drawingNo && (
                  <p className="text-sm text-red-500">{errors.drawingNo.message}</p>
                )}
              </div>

              {/* Process Name */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="processName">Process Name</Label>
                <Input
                  id="processName"
                  placeholder="Enter process name"
                  {...register("processName", { required: "Process name is required" })}
                />
                {errors.processName && (
                  <p className="text-sm text-red-500">{errors.processName.message}</p>
                )}
              </div>

              {/* Machine Name */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="machineName">Machine Name</Label>
                <Input
                  id="machineName"
                  placeholder="Enter machine name"
                  {...register("machineName", { required: "Machine name is required" })}
                />
                {errors.machineName && (
                  <p className="text-sm text-red-500">{errors.machineName.message}</p>
                )}
              </div>

              {/* Total Quantity */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="totalQuantity">Total Quantity of Lot</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  placeholder="Enter total quantity"
                  {...register("totalQuantity", { required: "Total quantity is required" })}
                />
                {errors.totalQuantity && (
                  <p className="text-sm text-red-500">{errors.totalQuantity.message}</p>
                )}
              </div>

              {/* Used Quantity */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="usedQuantity">Used Quantity</Label>
                <Input
                  id="usedQuantity"
                  type="number"
                  placeholder="Enter used quantity"
                  {...register("usedQuantity", { required: "Used quantity is required" })}
                />
                {errors.usedQuantity && (
                  <p className="text-sm text-red-500">{errors.usedQuantity.message}</p>
                )}
              </div>

              {/* Residual Quantity */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="residualQuantity">Residual Quantity of Lot</Label>
                <Input
                  id="residualQuantity"
                  type="number"
                  placeholder="Enter residual quantity"
                  {...register("residualQuantity", { required: "Residual quantity is required" })}
                />
                {errors.residualQuantity && (
                  <p className="text-sm text-red-500">{errors.residualQuantity.message}</p>
                )}
              </div>

              {/* Defect Rate */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="defectRate">Defect Rate (%)</Label>
                <Input
                  id="defectRate"
                  type="number"
                  step="0.01"
                  placeholder="Enter defect rate"
                  {...register("defectRate", { required: "Defect rate is required" })}
                />
                {errors.defectRate && (
                  <p className="text-sm text-red-500">{errors.defectRate.message}</p>
                )}
              </div>

              {/* Manager Instructions */}
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <Label htmlFor="managerInstructions">
                  Temporary Treatment & Manager Instructions
                </Label>
                <Textarea
                  id="managerInstructions"
                  placeholder="Enter temporary treatment and manager instructions..."
                  {...register("managerInstructions", { required: "Instructions are required" })}
                />
                {errors.managerInstructions && (
                  <p className="text-sm text-red-500">{errors.managerInstructions.message}</p>
                )}
              </div>

              {/* Product Image */}
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <Label htmlFor="productImage">Product Image</Label>
                <Input
                  id="productImage"
                  type="file"
                  accept="image/*"
                  {...register("productImage")}
                  onChange={handleImageChange} 
                  
                />
                {errors.productImage && (
                  <p className="text-sm text-red-500">{errors.productImage.message}</p>
                )}
                  {/* 👇 Image Preview */}
                {preview && (
                  <div className="mt-3 flex justify-center">
                  <a href={preview} target="_blank" rel="noopener noreferrer">
                    <img
                      src={preview}
                      alt="Preview"
                      className="
                        max-w-full
                        max-h-40
                        object-contain
                        rounded-md
                        border
                        border-gray-300
                        shadow-sm hover:scale-105 transition-transform duration-200

                      "
                    />
                    </a>
                  </div>
                )
                }

              </div>

            </div>
          </section>

          {/* ====================== QUALITY CHECK COMMENT ====================== */}
          <section className="space-y-6">
                <h2 className="text-2xl font-semibold border-b pb-2">Quality Check Comment</h2>
                <div className="grid gap-6 md:grid-cols-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">

                    {/* QC Comment */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="qcComment">QC Comment</Label>
                      <Textarea
                        id="qcComment"
                        placeholder="Enter QC comment..."
                        {...register("qcComment", {
                          required: "QC comment is required",
                        })}
                      />
                      {errors.qcComment && (
                        <p className="text-sm text-red-500">{errors.qcComment.message}</p>
                      )}
                    </div>

                    {/* Status / Approval Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="approvalStatus">Approval Status</Label>
                        <select
                          id="approvalStatus"
                          className="border rounded-md p-2 bg-background"
                          {...register("approvalStatus", { required: "Approval status is required" })}
                        >
                          <option value="">Select status</option>
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="return-lot">Return the Lot</option>
                          <option value="reworking">Reworking</option>
                          <option value="sorting-use">Sorting / Use</option>
                          <option value="sorting-not-use">Sorting / Not Use</option>
                          <option value="regrading">Re-grading</option>
                          <option value="not-use">Not Use</option>
                          <option value="concession">Concession</option>
                        </select>
                        {errors.approvalStatus && (
                          <p className="text-sm text-red-500">{errors.approvalStatus.message}</p>
                        )}
                      </div>

                      {/* Approved / Issued By */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="checkedByQC">Checked / Issued By</Label>
                        <Input
                          id="checkedByQC"
                          placeholder="e.g., Varun / Ravi"
                          {...register("checkedByQC", { required: "This field is required" })}
                        />
                        {errors.checkedByQC && (
                          <p className="text-sm text-red-500">{errors.checkedByQC.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Remarks or Instructions */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="qcInstructions">QC Instructions</Label>
                      <Textarea
                        id="qcInstructions"
                        placeholder="e.g., First need 100% sorting, then use if OK..."
                        {...register("qcInstructions", { required: "Instructions are required" })}
                      />
                      {errors.qcInstructions && (
                        <p className="text-sm text-red-500">{errors.qcInstructions.message}</p>
                      )}
                    </div>

                    {/* Cost of Defective Work */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="defectCost">Cost of Defective Work ($)</Label>
                        <Input
                          id="defectCost"
                          type="number"
                          step="0.01"
                          placeholder="Enter cost"
                          {...register("defectCost", { required: "Cost is required" })}
                        />
                        {errors.defectCost && (
                          <p className="text-sm text-red-500">{errors.defectCost.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="unit">Unit (kg / piece)</Label>
                        <Input
                          id="unit"
                          placeholder="Enter unit (e.g., kg or piece)"
                          {...register("unit", { required: "Unit is required" })}
                        />
                        {errors.unit && (
                          <p className="text-sm text-red-500">{errors.unit.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Occurrence Section / Supplier */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="occurrenceSection">Occurrence Section / Supplier</Label>
                      <Input
                        id="occurrenceSection"
                        placeholder="e.g., Assy Area"
                        {...register("occurrenceSection", { required: "Occurrence section is required" })}
                      />
                      {errors.occurrenceSection && (
                        <p className="text-sm text-red-500">{errors.occurrenceSection.message}</p>
                      )}
                    </div>

                    {/* Important Level */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="importanceLevel">Importance Level</Label>
                      <select
                        id="importanceLevel"
                        className="border rounded-md p-2 bg-background"
                        {...register("importanceLevel", { required: "Importance level is required" })}
                      >
                        <option value="">Select level</option>
                        <option value="AA">AA</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                      {errors.importanceLevel && (
                        <p className="text-sm text-red-500">{errors.importanceLevel.message}</p>
                      )}
                    </div>

                    {/* Report Time Limit */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="reportTimeLimit">Report Time Limit</Label>
                      <Input
                        id="reportTimeLimit"
                        type="date"
                        {...register("reportTimeLimit", { required: "Report time limit is required" })}
                      />
                      {errors.reportTimeLimit && (
                        <p className="text-sm text-red-500">{errors.reportTimeLimit.message}</p>
                      )}
                    </div>

                </div>
          </section>

          {/* ====================== MEASURES REPORT ====================== */}
          <section className="space-y-6">
                <h2 className="text-2xl font-semibold border-b pb-2">Measures Report</h2>
                <div className="grid gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm col-span-2 border-blue-500">

                    {/* Measures Report */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="measuresReport">Measures Report</Label>
                      <Textarea
                        id="measuresReport"
                        placeholder="Enter details of the measures taken..."
                        {...register("measuresReport", { required: "Measures report is required" })}
                      />
                      {errors.measuresReport && (
                        <p className="text-sm text-red-500">{errors.measuresReport.message}</p>
                      )}
                    </div>

                    {/* Section (Group) in Charge */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="responsibleSection">Section (Group) in Charge</Label>
                      <Input
                        id="responsibleSection"
                        placeholder="Enter responsible section or group"
                        {...register("responsibleSection", {
                          required: "Responsible section is required",
                        })}
                      />
                      {errors.responsibleSection && (
                        <p className="text-sm text-red-500">{errors.responsibleSection.message}</p>
                      )}
                    </div>

                    {/* Causes of Occurrence and Outflow */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="causeDetails">
                        Causes of Occurrence and Causes of Outflow
                      </Label>
                      <Textarea
                        id="causeDetails"
                        placeholder="Describe causes of occurrence and causes of outflow..."
                        {...register("causeDetails", { required: "Cause details are required" })}
                      />
                      {errors.causeDetails && (
                        <p className="text-sm text-red-500">{errors.causeDetails.message}</p>
                      )}
                    </div>

                    {/* Countermeasures (temporary / permanent) */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="countermeasures">
                        Counter measures for Cause and Outflow (Temporary / Permanent)
                      </Label>
                      <Textarea
                        id="countermeasures"
                        placeholder="Describe temporary and permanent countermeasures..."
                        {...register("countermeasures", { required: "Countermeasures are required" })}
                      />
                      {errors.countermeasures && (
                        <p className="text-sm text-red-500">{errors.countermeasures.message}</p>
                      )}
                    </div>

                    {/* Measures Enforcement Date */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="enforcementDate">Measures Enforcement Date</Label>
                      <Input
                        id="enforcementDate"
                        type="date"
                        {...register("enforcementDate", { required: "Enforcement date is required" })}
                      />
                      {errors.enforcementDate && (
                        <p className="text-sm text-red-500">{errors.enforcementDate.message}</p>
                      )}
                    </div>

                    {/* Standardization / Preventive Measures */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="standardization">
                        Standardization of Measures / Preventive Measures (Wide Deployment)
                      </Label>
                      <Textarea
                        id="standardization"
                        placeholder="Describe how measures are standardized or deployed widely..."
                        {...register("standardization", {
                          required: "Standardization details are required",
                        })}
                      />
                      {errors.standardization && (
                        <p className="text-sm text-red-500">{errors.standardization.message}</p>
                      )}
                    </div>
                </div>
          </section>

          {/* ====================== Results of Measures ====================== */}
          <section className="space-y-6">
                  <h2 className="text-2xl font-semibold border-b pb-2">Results of Measures</h2>
                  <div className="grid gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">
                      {/* --- Result of Measures Enforcement --- */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="enforcementDateResult">Date (Enforcement)</Label>
                          <Input
                            id="enforcementDateResult"
                            type="date"
                            {...register("enforcementDateResult", {
                              required: "Date of enforcement result is required",
                            })}
                          />
                          {errors.enforcementDateResult && (
                            <p className="text-sm text-red-500">
                              {errors.enforcementDateResult.message}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1.5 md:col-span-2">
                          <Label htmlFor="enforcementResult">
                            Result of Measures Enforcement (Comment)
                          </Label>
                          <Textarea
                            id="enforcementResult"
                            placeholder="Describe result of measures enforcement..."
                            {...register("enforcementResult", {
                              required: "Enforcement result is required",
                            })}
                          />
                          {errors.enforcementResult && (
                            <p className="text-sm text-red-500">{errors.enforcementResult.message}</p>
                          )}
                        </div>
                      </div>

                      {/* --- Enforcement Approval Table --- */}
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="enforcementJudgment">Judgment</Label>
                          <Input
                            id="enforcementJudgment"
                            placeholder="Enter judgment"
                            {...register("enforcementJudgment")}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="enforcementSecInCharge">Sec. in Charge</Label>
                          <Input
                            id="enforcementSecInCharge"
                            placeholder="Enter section in charge"
                            {...register("enforcementSecInCharge")}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="enforcementQCSection">QC Section</Label>
                          <Input
                            id="enforcementQCSection"
                            placeholder="Enter QC section"
                            {...register("enforcementQCSection")}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label>Approvals</Label>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Approved</span>
                            <Input
                              type="checkbox"
                              {...register("enforcementApproved")}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                      </div>

                      {/* --- Divider --- */}
                      <hr className="my-6 border-muted" />

                      {/* --- Result of Measures Effect --- */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="effectDate">Date (Effect)</Label>
                          <Input
                            id="effectDate"
                            type="date"
                            {...register("effectDate", { required: "Date of effect is required" })}
                          />
                          {errors.effectDate && (
                            <p className="text-sm text-red-500">{errors.effectDate.message}</p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1.5 md:col-span-2">
                          <Label htmlFor="effectResult">
                            Result of Measures Effect (Comment)
                          </Label>
                          <Textarea
                            id="effectResult"
                            placeholder="Describe result of measures effect..."
                            {...register("effectResult", {
                              required: "Effect result is required",
                            })}
                          />
                          {errors.effectResult && (
                            <p className="text-sm text-red-500">{errors.effectResult.message}</p>
                          )}
                        </div>
                      </div>

                      {/* --- Effect Approval Table --- */}
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="effectJudgment">Judgment</Label>
                          <Input
                            id="effectJudgment"
                            placeholder="Enter judgment"
                            {...register("effectJudgment")}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="effectSecInCharge">Sec. in Charge</Label>
                          <Input
                            id="effectSecInCharge"
                            placeholder="Enter section in charge"
                            {...register("effectSecInCharge")}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="effectQCSection">QC Section</Label>
                          <Input
                            id="effectQCSection"
                            placeholder="Enter QC section"
                            {...register("effectQCSection")}
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label>Approvals</Label>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Approved</span>
                            <Input
                              type="checkbox"
                              {...register("effectApproved")}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                      </div>
                  </div>
          </section>

        </CardContent>
        {
          location.state?.data?.status != "approved" && (
            <CardFooter className="flex justify-center py-6">
          <Button type="submit" className="px-8 py-2 text-lg mx-3">
            {
              (location?.state?.data?.status === "pending_quality" && user.team === "Quality") ? "Reject":"Submit"
            }
          </Button>
         {
          (location?.state?.data?.status === "pending_quality" && user.team === "Quality") && (
            <Button  type="button" className="px-8 py-2 text-lg mx-3" onClick={()=>{handleApprove(location.state?.data?._id)}}>
             Approve
          </Button>
          )
         } 
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Form Approved ✅</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            The form has been approved and the report has been generated.
          </div>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>     
            </CardFooter>
          )
        }
        
      </form>
    </Card>
  );
};

export default QualityForm;
