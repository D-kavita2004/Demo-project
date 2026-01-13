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
const handleProdResponse = async (id, formData, prodFile) => {
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
                              {ProdFilePreview && (
                                <iframe
                                  src={ProdFilePreview}
                                  title="PDF Preview"
                                  className="w-full h-96 border"
                                />
                              )}
                              </div>

                        
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </section>
                    )}
                  </PermissionedSection>
        
                  </Accordion>
              </CardContent>
            
            </form>
        </Card>
    </div>
  );
};
export default QualityForm;