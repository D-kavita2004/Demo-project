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
import { data, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from '@hookform/resolvers/zod';
// import { formDataSchema } from "../ValidateSchema/formDataValidationSchema";
import {myData} from "../Utils/DefaultData";
import { PermissionedSection } from "../Utils/sectionPermissionWrapper";
import { GetRelatedSchema } from "../Utils/sectionPermissionWrapper";
import HistoryTracking from "../ReusableComponents/HistoryTracking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QualityForm = () => {

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
 
  const clickedForm = location.state?.data;
  const formFromState = clickedForm?.formData;  //preview existing data
  const myDefaultData = formFromState || myData;
  
  const [isNewForm, setIsNewForm] = useState(!clickedForm); 

  const [suppliersList, setSuppliersList] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [machinesList, setMachinesList] = useState([]);
  const [processesList, setProcessesList] = useState([]);

  const [ImagePreview, setImagePreview] = useState(null); // image preview state
  const [ProdFilePreview, setProdFilePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState:{errors},
  } = useForm(
    {
      defaultValues:myDefaultData,
      resolver:zodResolver(GetRelatedSchema(clickedForm?.status, isNewForm)),
    });

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

const productImageFile = watch("defectivenessDetail.productImage");
const prodFile = watch("measuresReport.prodFile");

useEffect(() => {
  let imgUrl;
  let pdfUrl;

  // --------- Image Preview ----------
  if (isNewForm && productImageFile?.length > 0 && productImageFile[0] instanceof File) {
    imgUrl = URL.createObjectURL(productImageFile[0]);
    setImagePreview(imgUrl);
  } else {
    console.log(clickedForm?.formData?.defectivenessDetail?.productImage);
    setImagePreview(clickedForm?.formData?.defectivenessDetail?.productImage || null);
  }

  // --------- PDF Preview ----------
  if (isNewForm && prodFile?.length > 0 && prodFile[0] instanceof File) {
    pdfUrl = URL.createObjectURL(prodFile[0]);
    setProdFilePreview(pdfUrl);
  } else {
    setProdFilePreview(clickedForm?.formData?.measuresReport?.prodFile || null);
  }

  // Cleanup function to revoke object URLs when component unmounts or files change
  return () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };
}, [productImageFile, prodFile, isNewForm, clickedForm]);



const onSubmit = async (formData) => {
  try {
    
    if (!clickedForm) {
      // New form — only pass formData
      await primaryAction.handler(formData);
    } else {
      // Existing form — pass id + formData
      await primaryAction.handler(clickedForm._id, formData);
    }
  } catch (err) {
    console.error("Error submitting form:", err);
  }
};

const handleApprove = async (id,formData) => {

    try {
      console.log(formData);
      // Call the API to approve the form
      const response = await api.put(
        `${apiUrl}/forms/approve`,
        {formId:id,data:formData},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form approved:", response.data);
      navigate("/");
      toast.success(response?.data?.message || "Issue Approved sucessfully");
      // Open modal after approval
      setIsOpen(true);
    } catch (error) {
       toast.error(error?.response?.data?.message || error?.response?.statusText || "Oops! Issue could not be approved");
      console.error("Error approving form:", error.response?.data || error);
    } 
  };
const handleReject = async (id,formData) => {
    try {
      // Call the API to reject the form
      const response = await api.put(
        `${apiUrl}/forms/reject`,
        {formId:id,data:formData},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form rejected:", response.data);
      navigate("/");
      toast.success(response?.data?.message || "Issue Rejected sucessfully");
    } catch (error) {
       toast.error(error?.response?.data?.message || error?.response?.statusText || "Oops! Issue could not be rejected");
      console.error("Error rejecting form:", error.response?.data || error);
    }
  };
const handleCreateNewIssue = async (formData) => {
      try {
          const data = new FormData();
          
          // Append productImage file if selected
          if (productImageFile && productImageFile[0]) {
            data.append("productImage", productImageFile[0]);
          }

          // Append other form fields (formData object)
          data.append("data", JSON.stringify(formData));

          const res = await api.post(`${apiUrl}/forms`, data, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          console.log("Form submitted successfully:", res.data);
          navigate("/");
          toast.success(res?.data?.message || "Issue Created sucessfully");
        } 
      catch (err) {
        toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! Issue could not be created");
          console.error("Error submitting form:", err);
        }
};
const handleProdResponse = async (id, formData) => {
  try {
    const fd = new FormData();

    fd.append("data", JSON.stringify(formData));
    console.log(prodFile[0]);

    // optional PDF upload
    if (prodFile && prodFile[0]) {
      fd.append("prodFile", prodFile[0]); 
    }

    const response = await api.put(
      `${apiUrl}/forms/prodResponse/${id}`,
      fd,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Form response submitted:", response.data);
    navigate("/");
    toast.success(
      response?.data?.message || "Response submitted successfully"
    );
    setIsOpen(true);

  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error?.response?.statusText ||
      "Oops! Response could not be submitted"
    );
    console.error("Error submitting response:", error.response?.data || error);
  }
};

const handleFinalSubmit = async (id,formData) => {

    try {
      // Call the API to approve the form
      const response = await api.put(
        `${apiUrl}/forms/finalSubmit`,
        {formId:id,data:formData},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form approved:", response.data);
      navigate("/");
       toast.success(response?.data?.message || "Final submit is sucessfully");
      // Open modal after approval
      setIsOpen(true);
    } catch (error) {
       toast.error(error?.response?.data?.message || error?.response?.statusText || "Oops! could not be submit");
      console.error("Error approving form:", error.response?.data || error);
    } 
  };

  // ---------------- PRIMARY ACTION ----------------
const getPrimaryAction = () => {
    if (!clickedForm) {
      return { label: "Create New Issue", handler: handleCreateNewIssue };
    }

    const { status } = clickedForm;
    const { flag } = user.team;

    if (status === "pending_prod" && flag === "INTERNAL") {
      return { label: "Submit", handler: handleProdResponse };
    }

    if (status === "approved" && flag === "QA") {
      return { label: "Final Submit", handler: handleFinalSubmit };
    }

    return null;
};
const primaryAction = getPrimaryAction();

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
  if(isNewForm){
    fetchAllSuppliers();
    fetchAllParts();  
    fetchAllProcesses();
    fetchAllMachines();
  }
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
      
        <Card className="w-[90%] lg:w-[70%] mx-auto mt-8 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-center">
                Product Review Form
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              
           
              <CardContent>
                  <Accordion type="multiple" className="w-full flex flex-col gap-5 my-6">

                  {/* ====================== ISSUING SECTION ====================== */}
                  <PermissionedSection sectionKey="issuingSection" isNewForm={isNewForm} formStatus={clickedForm?.status} >
                       {
                        (access)=>{
                          return(
                        <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                          <AccordionItem value="item-1" className="w-full">
                            <AccordionTrigger><h2 className="text-2xl font-semibold border-b pb-2">Issuing Section</h2></AccordionTrigger>

                            <AccordionContent className="w-full">
                                <div className="w-full grid md:grid-cols-2 gap-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">
                                  {/* Receiving No. */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="receivingNo">Receiving No.</Label>
                                    <Input
                                      id="receivingNo"
                                      readOnly={access=="read"}
                                      placeholder="Enter receiving number"
                                      {...register("issuingSection.receivingNo")}
                                    />
                                    {errors.issuingSection?.receivingNo && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.receivingNo.message}</p>
                                    )}
                                  </div>

                                  {/* Reference No. */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="referenceNo">Reference No.</Label>
                                    <Input
                                      id="referenceNo"
                                       readOnly={access=="read"}
                                      placeholder="Enter reference number"
                                      {...register("issuingSection.referenceNo")}
                                    />
                                    {errors.issuingSection?.referenceNo && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.referenceNo.message}</p>
                                    )}
                                  </div>

                                  {/* Part Name */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="partName">Part Name</Label>
                                    {
                                      isNewForm ? 
                                      (
                                    <Select
                                      value={watch("issuingSection.part")}
                                      readOnly={access=="read"}
                                      onValueChange={(v) => setValue("issuingSection.part", v)}
                                      required
                                    >
                                      <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
                                      ):
                                      (
                                    <Input
                                      value={
                                        clickedForm?.formData?.issuingSection?.part?.partName || ""
                                      }
                                      readOnly={access=="read"}
                                      className="bg-muted cursor-not-allowed"
                                    />
                                      )
                                    }
                                    {errors.issuingSection?.part && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.part.message}</p>
                                    )}
                                  </div>

                                  {/* Subject Matter */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="subjectMatter">Subject Matter</Label>
                                    <Input
                                      id="subjectMatter"
                                      placeholder="Enter subject matter"
                                      readOnly={access=="read"}
                                      {...register("issuingSection.subjectMatter")}
                                    />
                                    {errors.issuingSection?.subjectMatter && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.subjectMatter.message}</p>
                                    )}
                                  </div>

                                  {/* Approved */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="approved">Approved By</Label>
                                    <Input
                                      id="approved"
                                      readOnly={access=="read"}
                                      placeholder="Enter approver name"
                                      {...register("issuingSection.approved")}
                                    />
                                    {errors.issuingSection?.approved && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.approved.message}</p>
                                    )}
                                  </div>

                                  {/* Checked */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="checked">Checked By</Label>
                                    <Input
                                      id="checked"
                                       readOnly={access=="read"}
                                      placeholder="Enter checker name"
                                      {...register("issuingSection.checked")}
                                    />
                                    {errors.issuingSection?.checked && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.checked.message}</p>
                                    )}
                                  </div>

                                  {/* Issued */}
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="issued">Issued By</Label>
                                    <Input
                                      id="issued"
                                       readOnly={access=="read"}
                                      defaultValue={(user?.firstName || "") + " " + (user?.lastName || "")}
                                      placeholder="Enter receiver name"
                                      {...register("issuingSection.issued")}
                                    />
                                    {errors.issuingSection?.issued && (
                                      <p className="text-sm text-red-500">{errors.issuingSection.issued.message}</p>
                                    )}
                                  </div>

                                </div>
                            </AccordionContent>
                          </AccordionItem>
                        </section>
                          )
                        }
                       }
                  </PermissionedSection>

                  {/* ====================== DEFECTIVENESS DETAIL ====================== */}
                  <PermissionedSection
                    sectionKey="defectivenessDetail"
                    isNewForm={isNewForm}
                    formStatus={clickedForm?.status}
                  >
                    {(access) => (
                      <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                        <AccordionItem value="item-2" className="w-full">
                          <AccordionTrigger>
                            <h2 className="text-2xl font-semibold border-b pb-2">Defectiveness Detail</h2>
                          </AccordionTrigger>
                          <AccordionContent className="w-full">
                            <div className="w-full grid md:grid-cols-2 gap-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">

                              {/* Section / Supplier Name */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="supplierName">Section / Supplier Name</Label>
                                {isNewForm ? (
                                  <Select
                                    value={watch("defectivenessDetail.supplier")}
                                    onValueChange={(v) => setValue("defectivenessDetail.supplier", v)}
                                    required
                                    disabled={access === "read"}
                                  >
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
                                ) : (
                                  <Input
                                    value={clickedForm?.formData?.defectivenessDetail?.supplier?.supplierName || ""}
                                    readOnly={access === "read"}
                                    className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                  />
                                )}
                                {errors.defectivenessDetail?.supplier && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.supplier.message}</p>
                                )}
                              </div>

                              {/* Group Name */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="groupName">Group Name</Label>
                                <Input
                                  id="groupName"
                                  placeholder="Enter group name"
                                  {...register("defectivenessDetail.groupName")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.groupName && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.groupName.message}</p>
                                )}
                              </div>

                              {/* State of Process */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="stateOfProcess">State of Process</Label>
                                <Input
                                  id="stateOfProcess"
                                  placeholder="Enter state of process"
                                  {...register("defectivenessDetail.stateOfProcess")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.stateOfProcess && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.stateOfProcess.message}</p>
                                )}
                              </div>

                              {/* Associated Lot No. */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="associatedLotNo">Associated Lot No.</Label>
                                <Input
                                  id="associatedLotNo"
                                  placeholder="Enter associated lot number"
                                  {...register("defectivenessDetail.associatedLotNo")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.associatedLotNo && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.associatedLotNo.message}</p>
                                )}
                              </div>

                              {/* Discovered Date */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="discoveredDate">Discovered Date</Label>
                                <Input
                                  id="discoveredDate"
                                  type="date"
                                  {...register("defectivenessDetail.discoveredDate")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.discoveredDate && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.discoveredDate.message}</p>
                                )}
                              </div>

                              {/* Issue Date */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="issueDate">Issue Date</Label>
                                <Input
                                  id="issueDate"
                                  type="date"
                                  {...register("defectivenessDetail.issueDate")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.issueDate && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.issueDate.message}</p>
                                )}
                              </div>

                              {/* Order No. / Lot No. */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="orderNo">Order No. / Lot No.</Label>
                                <Input
                                  id="orderNo"
                                  placeholder="Enter order or lot number"
                                  {...register("defectivenessDetail.orderNo")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.orderNo && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.orderNo.message}</p>
                                )}
                              </div>

                              {/* Drawing No. */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="drawingNo">Drawing No.</Label>
                                <Input
                                  id="drawingNo"
                                  placeholder="Enter drawing number"
                                  {...register("defectivenessDetail.drawingNo")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.drawingNo && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.drawingNo.message}</p>
                                )}
                              </div>

                              {/* Process Name */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="processName">Process Name</Label>
                                {isNewForm ? (
                                  <Select
                                    value={watch("defectivenessDetail.process")}
                                    onValueChange={(v) => setValue("defectivenessDetail.process", v)}
                                    required
                                    disabled={access === "read"}
                                  >
                                    <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
                                ) : (
                                  <Input
                                    value={clickedForm?.formData?.defectivenessDetail?.process?.processName || ""}
                                    readOnly={access === "read"}
                                    className="bg-muted cursor-not-allowed"
                                  />
                                )}
                                {errors.defectivenessDetail?.process && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.process.message}</p>
                                )}
                              </div>

                              {/* Machine Name */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="machineName">Machine Name</Label>
                                {isNewForm ? (
                                  <Select
                                    value={watch("defectivenessDetail.machine")}
                                    onValueChange={(v) => setValue("defectivenessDetail.machine", v)}
                                    required
                                    disabled={access === "read"}
                                  >
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
                                ) : (
                                  <Input
                                    value={clickedForm?.formData?.defectivenessDetail?.machine?.machineName || ""}
                                    readOnly={access === "read"}
                                    className="bg-muted cursor-not-allowed"
                                  />
                                )}
                                {errors.defectivenessDetail?.machine && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.machine.message}</p>
                                )}
                              </div>

                              {/* Total Quantity */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="totalQuantity">Total Quantity of Lot</Label>
                                <Input
                                  id="totalQuantity"
                                  type="number"
                                  placeholder="Enter total quantity"
                                  {...register("defectivenessDetail.totalQuantity")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.totalQuantity && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.totalQuantity.message}</p>
                                )}
                              </div>

                              {/* Used Quantity */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="usedQuantity">Used Quantity</Label>
                                <Input
                                  id="usedQuantity"
                                  type="number"
                                  placeholder="Enter used quantity"
                                  {...register("defectivenessDetail.usedQuantity")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.usedQuantity && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.usedQuantity.message}</p>
                                )}
                              </div>

                              {/* Residual Quantity */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="residualQuantity">Residual Quantity of Lot</Label>
                                <Input
                                  id="residualQuantity"
                                  type="number"
                                  placeholder="Enter residual quantity"
                                  {...register("defectivenessDetail.residualQuantity")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.residualQuantity && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.residualQuantity.message}</p>
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
                                  {...register("defectivenessDetail.defectRate")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.defectRate && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.defectRate.message}</p>
                                )}
                              </div>

                              {/* Manager Instructions */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="managerInstructions">Manager Instructions</Label>
                                <Textarea
                                  id="managerInstructions"
                                  placeholder="Enter temporary treatment and manager instructions..."
                                  {...register("defectivenessDetail.managerInstructions")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.defectivenessDetail?.managerInstructions && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.managerInstructions.message}</p>
                                )}
                              </div>

                              {/* Product Image Upload */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="productImage">Product Image</Label>
                                <Input
                                  id="productImage"
                                  type="file"
                                  accept="image/*"
                                  {...register("defectivenessDetail.productImage")}
                                  disabled={access === "read"}
                                />
                                {errors.defectivenessDetail?.productImage && (
                                  <p className="text-sm text-red-500">{errors.defectivenessDetail.productImage.message}</p>
                                )}

                                {/* Image preview */}
                                {ImagePreview && (
                                  <div className="mt-3 flex justify-center">
                                    <a href={ImagePreview} target="_blank" rel="noopener noreferrer">
                                      <img
                                        src={ImagePreview}
                                        alt="Preview"
                                        className="max-w-full max-h-40 object-contain rounded-md border border-gray-300 shadow-sm hover:scale-105 transition-transform duration-200"
                                      />
                                    </a>
                                  </div>
                                )}
                              </div>

                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </section>
                    )}
                  </PermissionedSection>

                  {/* ====================== QUALITY CHECK COMMENT ====================== */}
                  <PermissionedSection
                    sectionKey="qualityCheckComment"
                    isNewForm={isNewForm}
                    formStatus={clickedForm?.status}
                  >
                    {(access) => (
                      <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                        <AccordionItem value="item-3" className="w-full">
                          <AccordionTrigger>
                            <h2 className="text-2xl font-semibold border-b pb-2">Quality Check Comment</h2>
                          </AccordionTrigger>
                          <AccordionContent className="w-full">
                            <div className="w-full grid md:grid-cols-2 gap-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">

                              {/* QC Comment */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="qcComment">QC Comment</Label>
                                <Textarea
                                  id="qcComment"
                                  placeholder="Enter QC comment..."
                                  {...register("qualityCheckComment.qcComment")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.qualityCheckComment?.qcComment && (
                                  <p className="text-sm text-red-500">{errors.qualityCheckComment.qcComment.message}</p>
                                )}
                              </div>

                              {/* QC Instructions */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="qcInstructions">QC Instructions</Label>
                                <Textarea
                                  id="qcInstructions"
                                  placeholder="e.g., First need 100% sorting, then use if OK..."
                                  {...register("qualityCheckComment.qcInstructions")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.qualityCheckComment?.qcInstructions && (
                                  <p className="text-sm text-red-500">{errors.qualityCheckComment.qcInstructions.message}</p>
                                )}
                              </div>

                              {/* Cost of Defective Work & Unit */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                  <Label htmlFor="defectCost">Cost of Defective Work ($)</Label>
                                  <Input
                                    id="defectCost"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter cost"
                                    {...register("qualityCheckComment.defectCost")}
                                    readOnly={access === "read"}
                                    className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                  />
                                  {errors.qualityCheckComment?.defectCost && (
                                    <p className="text-sm text-red-500">{errors.qualityCheckComment.defectCost.message}</p>
                                  )}
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                  <Label htmlFor="unit">Unit (kg / piece)</Label>
                                  <Input
                                    id="unit"
                                    placeholder="Enter unit (e.g., kg or piece)"
                                    {...register("qualityCheckComment.unit")}
                                    readOnly={access === "read"}
                                    className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                  />
                                  {errors.qualityCheckComment?.unit && (
                                    <p className="text-sm text-red-500">{errors.qualityCheckComment.unit.message}</p>
                                  )}
                                </div>
                              </div>

                              {/* Importance Level */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="importanceLevel">Importance Level</Label>
                                <select
                                  id="importanceLevel"
                                  className={`border rounded-md p-2 bg-background ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  {...register("qualityCheckComment.importanceLevel")}
                                  disabled={access === "read"}
                                >
                                  <option value="">Select level</option>
                                  <option value="AA">AA</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                </select>
                                {errors.qualityCheckComment?.importanceLevel && (
                                  <p className="text-sm text-red-500">{errors.qualityCheckComment.importanceLevel.message}</p>
                                )}
                              </div>

                              {/* Report Time Limit */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="reportTimeLimit">Report Time Limit</Label>
                                <Input
                                  id="reportTimeLimit"
                                  type="date"
                                  {...register("qualityCheckComment.reportTimeLimit")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.qualityCheckComment?.reportTimeLimit && (
                                  <p className="text-sm text-red-500">{errors.qualityCheckComment.reportTimeLimit.message}</p>
                                )}
                              </div>

                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </section>
                    )}
                  </PermissionedSection>
                  
                  {/* ====================== MEASURES REPORT ====================== */}
                  <PermissionedSection
                    sectionKey="measuresReport"
                    isNewForm={isNewForm}
                    formStatus={clickedForm?.status}
                  >
                    {(access) => (
                      <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                        <AccordionItem value="item-4" className="w-full">
                          <AccordionTrigger>
                            <h2 className="text-2xl font-semibold border-b pb-2">Measures Report</h2>
                          </AccordionTrigger>
                          <AccordionContent className="w-full">
                            <div className="w-full grid md:grid-cols-2 gap-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm col-span-2 border-blue-500">


                               {/* File Upload By Production Team*/}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="prodFile">Upload File Here : </Label>
                                <Input
                                  id="prodFile"
                                  type="file"
                                  accept="application/pdf"
                                  {...register("measuresReport.prodFile")}
                                  disabled={access === "read"}
                                />
                                {errors.measuresReport?.prodFile && (
                                  <p className="text-sm text-red-500">{errors.measuresReport?.prodFile.message}</p>
                                )}

                               {/* PDF Preview */}
                              {/* {ProdFilePreview && (
                                <iframe
                                  src={ProdFilePreview}
                                  title="PDF Preview"
                                  className="w-full h-96 border"
                                />
                              )} */}
                               {ProdFilePreview && (
                                  <a
                                    href={ProdFilePreview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline mt-2 w-fit"
                                  >
                                    📄 View uploaded file
                                  </a>
                                )}
                              </div>

                              {/* Causes of Occurrence */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="causesOfOccurrence">Causes of Occurrence</Label>
                                <Textarea
                                  id="causesOfOccurrence"
                                  placeholder="Describe causes of occurrence..."
                                  {...register("measuresReport.causesOfOccurrence")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.measuresReport?.causesOfOccurrence && (
                                  <p className="text-sm text-red-500">{errors.measuresReport.causesOfOccurrence.message}</p>
                                )}
                              </div>

                              {/* Causes of Outflow */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="causesOfOutflow">Causes of Outflow</Label>
                                <Textarea
                                  id="causesOfOutflow"
                                  placeholder="Describe causes of outflow..."
                                  {...register("measuresReport.causesOfOutflow")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.measuresReport?.causesOfOutflow && (
                                  <p className="text-sm text-red-500">{errors.measuresReport.causesOfOutflow.message}</p>
                                )}
                              </div>

                              {/* Countermeasures for Causes */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="counterMeasuresForCauses">Countermeasures for Cause</Label>
                                <Textarea
                                  id="counterMeasuresForCauses"
                                  placeholder="Describe temporary and permanent countermeasures..."
                                  {...register("measuresReport.counterMeasuresForCauses")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.measuresReport?.counterMeasuresForCauses && (
                                  <p className="text-sm text-red-500">{errors.measuresReport.counterMeasuresForCauses.message}</p>
                                )}
                              </div>

                              {/* Countermeasures for Outflow */}
                              <div className="flex flex-col space-y-1.5 md:col-span-2">
                                <Label htmlFor="counterMeasuresForOutflow">Countermeasures for Outflow</Label>
                                <Textarea
                                  id="counterMeasuresForOutflow"
                                  placeholder="Describe temporary and permanent countermeasures..."
                                  {...register("measuresReport.counterMeasuresForOutflow")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.measuresReport?.counterMeasuresForOutflow && (
                                  <p className="text-sm text-red-500">{errors.measuresReport.counterMeasuresForOutflow.message}</p>
                                )}
                              </div>

                              {/* Measures Enforcement Date */}
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="enforcementDate">Measures Enforcement Date</Label>
                                <Input
                                  id="enforcementDate"
                                  type="date"
                                  {...register("measuresReport.enforcementDate")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.measuresReport?.enforcementDate && (
                                  <p className="text-sm text-red-500">{errors.measuresReport.enforcementDate.message}</p>
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
                                  {...register("measuresReport.standardization")}
                                  readOnly={access === "read"}
                                  className={access === "read" ? "bg-muted cursor-not-allowed" : ""}
                                />
                                {errors.measuresReport?.standardization && (
                                  <p className="text-sm text-red-500">{errors.measuresReport.standardization.message}</p>
                                )}
                              </div>

                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </section>
                    )}
                  </PermissionedSection>

                  {/* ====================== Results of Measures Enforcement ====================== */}
                  <PermissionedSection
                    sectionKey="resultsOfMeasuresEnforcement"
                    isNewForm={isNewForm}
                    formStatus={clickedForm?.status}
                  >
                    {(access) => (
                      <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                        <AccordionItem value="item-5" className="w-full">
                          <AccordionTrigger>
                            <h2 className="text-2xl font-semibold border-b pb-2">Results of Measures Enforcement</h2>
                          </AccordionTrigger>
                          <AccordionContent className="w-full">
                            <div className="w-full p-6 rounded-xl border bg-card text-card-foreground shadow-sm border-blue-500 space-y-8">

                              {/* --- Result of Measures Enforcement --- */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                {/* Date Field */}
                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="enforcementDateResult">Date (Enforcement)</Label>
                                  <Input
                                    id="enforcementDateResult"
                                    type="date"
                                    {...register("resultsOfMeasuresEnforcement.enforcementDateResult")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                  {errors.resultsOfMeasuresEnforcement?.enforcementDateResult && (
                                    <p className="text-sm text-red-500">
                                      {errors.resultsOfMeasuresEnforcement.enforcementDateResult.message}
                                    </p>
                                  )}
                                </div>

                                {/* Comment Field – full width, next line */}
                                <div className="flex flex-col space-y-2 md:col-span-2">
                                  <Label htmlFor="enforcementResult">Result of Measures Enforcement (Comment)</Label>
                                  <Textarea
                                    id="enforcementResult"
                                    placeholder="Describe result of measures enforcement..."
                                    {...register("resultsOfMeasuresEnforcement.enforcementResult")}
                                    readOnly={access === "read"}
                                    className={`w-full min-h-[120px] ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                  {errors.resultsOfMeasuresEnforcement?.enforcementResult && (
                                    <p className="text-sm text-red-500">
                                      {errors.resultsOfMeasuresEnforcement.enforcementResult.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* --- Enforcement Approval Table --- */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="enforcementJudgment">Judgment</Label>
                                  <Input
                                    id="enforcementJudgment"
                                    placeholder="Enter judgment"
                                    {...register("resultsOfMeasuresEnforcement.enforcementJudgment")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                </div>

                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="enforcementSecInCharge">Sec. in Charge</Label>
                                  <Input
                                    id="enforcementSecInCharge"
                                    placeholder="Enter section in charge"
                                    {...register("resultsOfMeasuresEnforcement.enforcementSecInCharge")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                </div>

                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="enforcementQCSection">QC Section</Label>
                                  <Input
                                    id="enforcementQCSection"
                                    placeholder="Enter QC section"
                                    {...register("resultsOfMeasuresEnforcement.enforcementQCSection")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                </div>
                              </div>

                            </div>

                          </AccordionContent>
                        </AccordionItem>
                      </section>
                    )}
                  </PermissionedSection>

                   {
                    (clickedForm && clickedForm.history.length > 0) && <HistoryTracking historyTracks={clickedForm.history}/>
                  }
                  {/* ====================== Results of Measures Effect ====================== */}
                  <PermissionedSection
                    sectionKey="resultsOfMeasuresEffect"
                    isNewForm={isNewForm}
                    formStatus={clickedForm?.status}
                  >
                    {(access) => (
                      <section className="space-y-6 border-4 shadow-sm shadow-gray-700 px-3 rounded-2xl bg-gray-200">
                        <AccordionItem value="item-6" className="w-full">
                          <AccordionTrigger>
                            <h2 className="text-2xl font-semibold border-b pb-2">Results of Measures Effect</h2>
                          </AccordionTrigger>
                          <AccordionContent className="w-full">
                            <div className="w-full p-6 rounded-xl border bg-card text-card-foreground shadow-sm border-blue-500 space-y-8">

                              {/* --- Result of Measures Effect --- */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                {/* Date Field */}
                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="effectDate">Date (Effect)</Label>
                                  <Input
                                    id="effectDate"
                                    type="date"
                                    {...register("resultsOfMeasuresEffect.effectDate")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                  {errors.resultsOfMeasuresEffect?.effectDate && (
                                    <p className="text-sm text-red-500">
                                      {errors.resultsOfMeasuresEffect.effectDate.message}
                                    </p>
                                  )}
                                </div>

                                {/* Comment Field – full width, next line */}
                                <div className="flex flex-col space-y-2 md:col-span-2">
                                  <Label htmlFor="effectResult">Result of Measures Effect (Comment)</Label>
                                  <Textarea
                                    id="effectResult"
                                    placeholder="Describe result of measures effect..."
                                    {...register("resultsOfMeasuresEffect.effectResult")}
                                    readOnly={access === "read"}
                                    className={`w-full min-h-[120px] ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                  {errors.resultsOfMeasuresEffect?.effectResult && (
                                    <p className="text-sm text-red-500">
                                      {errors.resultsOfMeasuresEffect.effectResult.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* --- Effect Approval Table --- */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="effectJudgment">Judgment</Label>
                                  <Input
                                    id="effectJudgment"
                                    placeholder="Enter judgment"
                                    {...register("resultsOfMeasuresEffect.effectJudgment")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                </div>

                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="effectSecInCharge">Sec. in Charge</Label>
                                  <Input
                                    id="effectSecInCharge"
                                    placeholder="Enter section in charge"
                                    {...register("resultsOfMeasuresEffect.effectSecInCharge")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                </div>

                                <div className="flex flex-col space-y-2">
                                  <Label htmlFor="effectQCSection">QC Section</Label>
                                  <Input
                                    id="effectQCSection"
                                    placeholder="Enter QC section"
                                    {...register("resultsOfMeasuresEffect.effectQCSection")}
                                    readOnly={access === "read"}
                                    className={`w-full ${access === "read" ? "bg-muted cursor-not-allowed" : ""}`}
                                  />
                                </div>
                              </div>

                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </section>
                    )}
                  </PermissionedSection>
        
                  </Accordion>
              </CardContent>
             
              <CardFooter className="flex justify-center py-6 gap-3">
                 
                  {clickedForm?.status === "pending_quality" && user.team.flag === "QA" && (
                    <div className="mx-auto flex gap-4">
                      <Button
                          type="button"
                          className="px-8 py-2"
                          onClick={handleSubmit((formData) =>
                            handleApprove(clickedForm._id, formData)
                          )}
                        >
                          Approve
                      </Button>

                      <Button
                          type="button"
                          className="px-8 py-2"
                          onClick={handleSubmit((formData) =>
                            handleReject(clickedForm._id, formData)
                          )}
                        >
                          Reject
                      </Button>

                    </div>
                  )}

                  {/* Primary action button for other stages */}
                  {primaryAction && (
                    <Button
                      type="submit"
                      className="px-8 py-2 text-lg"
                    >
                      {primaryAction.label}
                    </Button>
                  )}
              </CardFooter>

            </form>
        </Card>
    </div>
  );
};
export default QualityForm;