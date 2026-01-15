
const QualityForm = () => {

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
 
  const clickedForm = location.state?.data;
  const formFromState = clickedForm?.formData;  //preview existing data
  const myDefaultData = formFromState || myData;
  
  const [isNewForm, setIsNewForm] = useState(!clickedForm); 

  const [ImagePreview, setImagePreview] = useState(null); // image preview state
  const [ProdFilePreview, setProdFilePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    clearErrors,
    formState:{errors},
  } = useForm(
    {
      defaultValues:myDefaultData,
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
    clearErrors();
    if (!clickedForm) {
      // New form — only pass formData
      await primaryAction.handler(formData);
    } 
    else {
      
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
    } catch (err) {
       if (err?.response?.status === 400) {
            const backendErrors = err?.response?.data?.errors;
            if (backendErrors) {
              Object.keys(backendErrors).forEach((field) => {
                setError(field, { message: backendErrors[field] });
              });
            }
            
            return;
        }  
        toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! Issue could not be approved");
      console.error("Error approving form:", err.response?.data || err);
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
    } catch (err) {
       if (err?.response?.status === 400) {
            const backendErrors = err?.response?.data?.errors;
            if (backendErrors) {
              Object.keys(backendErrors).forEach((field) => {
                setError(field, { message: backendErrors[field] });
              });
            }
            
            return;
        }  
        toast.error(err?.response?.data?.message || err?.response?.statusText || "Oops! Issue could not be rejected");
      console.error("Error rejecting form:", err.response?.data || err);
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
         if (err?.response?.status === 400) {
            const backendErrors = err?.response?.data?.errors;
            if (backendErrors) {
              Object.keys(backendErrors).forEach((field) => {
                setError(field, { message: backendErrors[field] });
              });
            }
            
            return;
        }  
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

  } catch (err) {
     if (err?.response?.status === 400) {
            const backendErrors = err?.response?.data?.errors;
            if (backendErrors) {
              Object.keys(backendErrors).forEach((field) => {
                setError(field, { message: backendErrors[field] });
              });
            }
            
            return;
        }  
        toast.error(err?.response?.data?.message || err?.response?.statusText ||
      "Oops! Response could not be submitted"
    );
    console.error("Error submitting response:", err.response?.data || err);
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
    } catch (err) {
        if (err?.response?.status === 400) {
            const backendErrors = err?.response?.data?.errors;
            if (backendErrors) {
              Object.keys(backendErrors).forEach((field) => {
                setError(field, { message: backendErrors[field] });
              });
            }
            
            return;
        }  
        toast.error(err?.response?.data?.message || err?.response?.statusText ||"Oops! could not be submit");
      console.error("Error approving form:", err.response?.data || err);
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