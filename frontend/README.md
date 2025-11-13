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
import { ArrowLeft } from "lucide-react";

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
  const [preview, setPreview] = useState(clickedForm?.formData?.productImage || "");
  const formFromState = clickedForm?.formData; 
  const myDefaultData = formFromState || myData;

  // const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  // const [isImageSelected,setIsImageSelected] = useState(false);
  // const [imageMsg,setimageMsg] = useState("");

  // console.log(myDefaultData);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
  console.log("calling modify form api", data);

  try {
    let imageUrl;
      if(uploadedImageUrl){
         imageUrl = uploadImage(data.productImage[0]);
      }
    // Step 1: Use the uploaded image URL
    const image = imageUrl || clickedForm?.formData?.productImage || "";

    // Step 2: Submit form data
    const res = await axios.post(`${apiUrl}/form/modifyForm`, {
      formId: location.state?.data?._id,
      formData: {
        ...data,
        productImage: image, //store the URL inside formData
      },
      filledBy: user.team,
      status: user.team === "Quality" ? "pending_prod" : "pending_quality",
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

                {/* ====================== DEFECTIVENESS DETAIL ====================== */}
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold border-b pb-2">Defectiveness Detail</h2>

                  <div className="grid gap-6 md:grid-cols-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">


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
    </div>
  );
};

export default QualityForm;
