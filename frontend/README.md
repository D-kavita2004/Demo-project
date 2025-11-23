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
import { zodResolver } from '@hookform/resolvers/zod';
import { formDataSchema } from "../ValidateSchema/formDataValidationSchema";

const QualityForm = () => {

 
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const clickedForm = location.state?.data;
  const [preview, setPreview] = useState(clickedForm?.formData?.productImage || "");
  const formFromState = clickedForm?.formData; 
  const myDefaultData = formFromState || myData;

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    formState:{errors},
  } = useForm({
    defaultValues:myDefaultData,
  resolver:zodResolver(formDataSchema)});

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
      if(uploadedImageUrl){                             //check if user uploaded something new
         imageUrl = await uploadImage(data.productImage[0]);
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
      console.error("Error approving form:", error.response?.data || error);
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
                      <Input
                        id="partName"
                        placeholder="Enter part name"
                        {...register("partName")}
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
                      <Label htmlFor="issued">Issued To</Label>
                      <Input
                        id="issued"
                        placeholder="Enter receiver name"
                        {...register("issued")}
                      />
                      {errors.issued && (
                        <p className="text-sm text-red-500">{errors.issued.message}</p>
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