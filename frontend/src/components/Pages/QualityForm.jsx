import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";
import { useContext } from "react";
import { UserContext } from "../Utils/userContext";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';
import { formDataSchema } from "../ValidateSchema/formDataValidationSchema";
import {myData} from "../Utils/DefaultData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QualityForm = () => {

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
 
  const clickedForm = location.state?.data;
  const [preview, setPreview] = useState(clickedForm?.formData?.productImage || "");
  const formFromState = clickedForm?.formData; 
  const myDefaultData = formFromState || myData;

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [suppliersList, setSuppliersList] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [machinesList, setMachinesList] = useState([]);
  const [processesList, setProcessesList] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState:{errors},
  } = useForm(
    {
      defaultValues:myDefaultData,
      resolver:zodResolver(formDataSchema)
    });

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("productImage", file);

  const res = await api.post(`${apiUrl}/image/productImage`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  console.log("Response",res);
  return res.data.url; // backend returns file URL
};


const onSubmit = async (data) => {
  console.log("calling modify form api", data);

  try {
    let imageUrl;
      if(uploadedImageUrl){                             //check if user uploaded something new
         imageUrl = await uploadImage(data.productImage[0]);
      }
    // Step 1: Use the uploaded image URL
    const image = imageUrl || clickedForm?.formData?.productImage || "";

    // Step 2: Submit form data
    const res = await api.post(`${apiUrl}/form/modifyForm`, {
      formId: location.state?.data?._id,
      formData: {
        ...data,
        productImage: image, //store the URL inside formData
      },
      filledBy: user.team,
      status: user.team === "QA" ? "pending_prod" : "pending_quality",
    },{withCredentials:true});

    console.log("Form submitted successfully:", res.data);
    navigate("/");
  } catch (err) {
    console.error("Error submitting form:", err);
  }
};

// Image preview handler
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
    setPreview(imageUrl);
  }
};

const handleApprove = async (id) => {

    try {
      // Call the API to approve the form
      const response = await api.post(
        `${apiUrl}/form/approveForm`,
        {formId:id},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form approved:", response.data);
      navigate("/");
      // Open modal after approval
      setIsOpen(true);
    } catch (error) {
      console.error("Error approving form:", error.response?.data || error);
    } 
  };


// Dropdowns
const fetchAllSuppliers = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`,
        { withCredentials: true }
      );
      setSuppliersList(res?.data?.suppliers);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch Suppliers"
      );
    }
};
const fetchAllParts = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/parts`,
        { withCredentials: true }
      );
      setPartsList(res?.data?.parts);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch parts"
      );
    }
};
const fetchAllProcesses = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/processes`,
        { withCredentials: true }
      );
      setProcessesList(res?.data?.processes);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch Processes"
      );
    }
};
const fetchAllMachines = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/machines`,
        { withCredentials: true }
      );
      setMachinesList(res?.data?.machines);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.statusText ||
          "Could not fetch Machines"
      );
    }
}

useEffect(()=>{
    fetchAllSuppliers();
    fetchAllParts();  
    fetchAllProcesses();
    fetchAllMachines();
},[]);

  return (
    <div className="flex flex-col">
      <Button
        variant="outline"
        className="w-fit ml-5 mt-5 flex items-center gap-2 text-sm font-medium border-gray-300 hover:bg-gray-100 transition-all"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
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
                        {...register("receivingNo")}
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
                        {...register("referenceNo")}
                      />
                      {errors.referenceNo && (
                        <p className="text-sm text-red-500">{errors.referenceNo.message}</p>
                      )}
                    </div>

                    {/* Part Name */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="partName">Part Name</Label>
                      <Select value={watch("partName")}  onValueChange={(v) => setValue("partName", v)} required>
                          <SelectTrigger  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <SelectValue placeholder="Select Part Name" />
                          </SelectTrigger>
                          <SelectContent>
                            {partsList.map((s) => (
                              <SelectItem key={s.partCode} value={s.partCode}>
                                {s.partName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        {...register("subjectMatter")}
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
                        {...register("approved")}
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
                        {...register("checked")}
                      />
                      {errors.checked && (
                        <p className="text-sm text-red-500">{errors.checked.message}</p>
                      )}
                    </div>

                    {/* Issued */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="issued">Issued By</Label>
                      <Input
                        id="issued"
                        defaultValue={(user?.firstName || "") + " " + (user?.lastName || "")}
                        placeholder="Enter receiver name"
                        {...register("issued")}
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
                     <Select value={watch("supplierName")}  onValueChange={(v) => setValue("supplierName", v)} required>
                          <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <SelectValue placeholder="Select Supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliersList.map((s) => (
                              <SelectItem key={s.supplierCode} value={s.supplierCode}>
                                {s.supplierName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                       </Select>
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
                        {...register("groupName")}
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
                        {...register("stateOfProcess" )}
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
                        {...register("associatedLotNo" )}
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
                        {...register("discoveredDate" )}
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
                        {...register("issueDate" )}
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
                        {...register("orderNo" )}
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
                        {...register("drawingNo" )}
                      />
                      {errors.drawingNo && (
                        <p className="text-sm text-red-500">{errors.drawingNo.message}</p>
                      )}
                    </div>

                    {/* Process Name */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="processName">Process Name</Label>
                     
                      <Select value={watch("processName")}  onValueChange={(v) => setValue("processName", v)} required>
                          <SelectTrigger  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <SelectValue placeholder="Select Process" />
                          </SelectTrigger>
                          <SelectContent>
                            {processesList.map((s) => (
                              <SelectItem key={s.processCode} value={s.processCode}>
                                {s.processName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      {errors.processName && (
                        <p className="text-sm text-red-500">{errors.processName.message}</p>
                      )}
                    </div>

                    {/* Machine Name */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="machineName">Machine Name</Label>
                      <Select value={watch("machineName")}  onValueChange={(v) => setValue("machineName", v)} required className="w-3/4">
                          <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <SelectValue placeholder="Select Machine" />
                          </SelectTrigger>
                          <SelectContent>
                            {machinesList.map((s) => (
                              <SelectItem key={s.machineCode} value={s.machineCode}>
                                {s.machineName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        {...register("totalQuantity" )}
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
                        {...register("usedQuantity" )}
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
                        {...register("residualQuantity" )}
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
                        {...register("defectRate" )}
                      />
                      {errors.defectRate && (
                        <p className="text-sm text-red-500">{errors.defectRate.message}</p>
                      )}
                    </div>

                    {/* Manager Instructions */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="managerInstructions">
                        Manager Instructions
                      </Label>
                      <Textarea
                        id="managerInstructions"
                        placeholder="Enter temporary treatment and manager instructions..."
                        {...register("managerInstructions" )}
                      />
                      {errors.managerInstructions && (
                        <p className="text-sm text-red-500">{errors.managerInstructions.message}</p>
                      )}
                    </div>

                    {/* Product Image */}
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                      <Label htmlFor="productImage">Product Image</Label>

                      {/* Image Input */}
                      <Input
                        id="productImage"
                        type="file"
                        accept="image/*"
                        {...register("productImage")}
                        onChange={(e) => {
                          handleImageChange(e);
                        }}
                      />
                      {errors.productImage && (
                        <p className="text-sm text-red-500">{errors.productImage.message}</p>
                      )}
                      {/* {imageMsg && (
                        <p className="text-sm text-red-500">{imageMsg}</p>
                      )} */}
                      {/* Upload button */}
                      {/* <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const file = watch("productImage")?.[0];
                          if (!file) {
                            setimageMsg("Please select an image before uploading.");
                            return;
                          }
                          try {
                            const url = await uploadImage(file);
                            setUploadedImageUrl(url);
                            setimageMsg("Image uploaded successfully!");
                          } catch (error) {
                            console.error("Image upload failed:", error);
                            setimageMsg("Image upload failed. Please try again.");
                          }
        }}
                      >
                        Upload Image
                      </Button> */}


                      {/* Image preview */}
                      {preview && (
                        <div className="mt-3 flex justify-center">
                          <a href={uploadedImageUrl || preview} target="_blank" rel="noopener noreferrer">
                            <img
                              src={uploadedImageUrl || preview}
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
                      )}
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
                              {...register("qcComment" )}
                            />
                            {errors.qcComment && (
                              <p className="text-sm text-red-500">{errors.qcComment.message}</p>
                            )}
                          </div>


                          {/* Remarks or Instructions */}
                          <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <Label htmlFor="qcInstructions">QC Instructions</Label>
                            <Textarea
                              id="qcInstructions"
                              placeholder="e.g., First need 100% sorting, then use if OK..."
                              {...register("qcInstructions" )}
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
                                {...register("defectCost" )}
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
                                {...register("unit" )}
                              />
                              {errors.unit && (
                                <p className="text-sm text-red-500">{errors.unit.message}</p>
                              )}
                            </div>
                          </div>

                          {/* Important Level */}
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="importanceLevel">Importance Level</Label>
                            <select
                              id="importanceLevel"
                              className="border rounded-md p-2 bg-background"
                              {...register("importanceLevel" )}
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
                              {...register("reportTimeLimit" )}
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

                          {/* Causes of Occurrence and Outflow */}
                          <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <Label htmlFor="causesOfOccurrence">
                              Causes of Occurrence
                            </Label>
                            <Textarea
                              id="causesOfOccurrence"
                              placeholder="Describe causes of occurrence..."
                              {...register("causesOfOccurrence" )}
                            />
                            {errors.causesOfOccurrence && (
                              <p className="text-sm text-red-500">{errors.causesOfOccurrence.message}</p>
                            )}
                          </div>

                           {/* Causes of Outflow */}
                          <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <Label htmlFor="causesOfOutflow">
                              Causes of Outflow
                            </Label>
                            <Textarea
                              id="causesOfOutflow"
                              placeholder="Describe causes of outflow..."
                              {...register("causesOfOutflow" )}
                            />
                            {errors.causeDetails && (
                              <p className="text-sm text-red-500">{errors.causeDetails.message}</p>
                            )}
                          </div>

                          {/* Countermeasures (temporary / permanent) */}
                          <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <Label htmlFor="countermeasures">
                              Counter measures for Cause
                            </Label>
                            <Textarea
                              id="counterMeasuresForCauses"
                              placeholder="Describe temporary and permanent countermeasures..."
                              {...register("counterMeasuresForCausess" )}
                            />
                            {errors.counterMeasuresForCauses && (
                              <p className="text-sm text-red-500">{errors.counterMeasuresForCauses.message}</p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <Label htmlFor="countermeasures">
                              Counter measures for Outflow 
                            </Label>
                            <Textarea
                              id="counterMeasuresForOutflow"
                              placeholder="Describe temporary and permanent countermeasures..."
                              {...register("counterMeasuresForOutflow" )}
                            />
                            {errors.counterMeasuresForOutflow && (
                              <p className="text-sm text-red-500">{errors.counterMeasuresForOutflow.message}</p>
                            )}
                          </div>

                          {/* Measures Enforcement Date */}
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="enforcementDate">Measures Enforcement Date</Label>
                            <Input
                              id="enforcementDate"
                              type="date"
                              {...register("enforcementDate" )}
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
                              {...register("standardization" )}
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
                                  {...register("enforcementDateResult" )}
                                />
                                {errors.enforcementDateResult && (
                                  <p className="text-sm text-red-500">
                                    {errors.enforcementDateResult}
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
                                  {...register("enforcementResult" )}
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
                                  {...register("effectDate" )}
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
                                  {...register("effectResult" )}
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
                            </div>
                        </div>
                </section>

              </CardContent>
              {
                location.state?.data?.status != "approved" && (
                  <CardFooter className="flex justify-center py-6">
                <Button type="submit" className="px-8 py-2 text-lg mx-3">
                  {
                    (location?.state?.data?.status === "pending_quality" && user.team === "QA") ? "Reject":"Submit"
                  }
                </Button>
              {
                (location?.state?.data?.status === "pending_quality" && user.team === "QA") && (
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
    </div>
  );
};
export default QualityForm;