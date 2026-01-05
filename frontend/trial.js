const QualityForm = () => {

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
 
  const clickedForm = location.state?.data;
  const formFromState = clickedForm?.formData;  //preview existing data
  const myDefaultData = formFromState || myData;
  
  const [isNewForm, setIsNewForm] = useState(!clickedForm); 


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState:{errors},
  } = useForm(
    {
      // defaultValues:myDefaultData,
      resolver:zodResolver(formDataSchema)
    });

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

const onSubmit = async (formData) => {
    try {
      const data = new FormData();

      data.append("formId", clickedForm?._id || "");

      // Append productImage file if selected
      if (productImageFile && productImageFile[0]) {
        data.append("productImage", productImageFile[0]);
      }

      // Append other form fields (formData object)
      data.append("formData", JSON.stringify(formData));

      const res = await api.post(`${apiUrl}/form/modifyForm`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      console.log("Form submitted successfully:", res.data);
      navigate("/");
    } catch (err) {
      console.error("Error submitting form:", err);
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
                 <PermissionedSection sectionKey="issuingSection" isNewForm={isNewForm} formStatus={clickedForm?.status} >
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold border-b pb-2">Issuing Section</h2>

                        <div className="grid gap-6 md:grid-cols-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm border-blue-500">

                          {/* Receiving No. */}
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="receivingNo">Receiving No.</Label>
                            <Input
                              id="receivingNo"
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
                              readOnly
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
                              defaultValue={(user?.firstName || "") + " " + (user?.lastName || "")}
                              placeholder="Enter receiver name"
                              {...register("issuingSection.issued")}
                            />
                            {errors.issuingSection?.issued && (
                              <p className="text-sm text-red-500">{errors.issuingSection.issued.message}</p>
                            )}
                          </div>

                        </div>
                    </section>
                 </PermissionedSection>
              </CardContent>

                <CardFooter className="flex justify-center py-6">

                  {/* Primary dynamic action button */}
                  {primaryAction && (
                    <Button
                      type="button"
                      className="px-8 py-2 text-lg mx-3"
                      onClick={primaryAction.handler}
                    >
                      {primaryAction.label}
                    </Button>
                  )}

                  {/* Approve button — separate explicit action */}
                  {clickedForm?.status === "pending_quality" &&
                    user.team.flag === "QA" && (
                      <Button
                        type="button"
                        className="px-8 py-2 text-lg mx-3"
                        onClick={() => handleApprove(clickedForm._id)}
                      >
                        Approve
                      </Button>
                    )}
                </CardFooter>

            </form>
        </Card>
    </div>
  );
};
export default QualityForm;