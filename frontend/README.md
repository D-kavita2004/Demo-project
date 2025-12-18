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