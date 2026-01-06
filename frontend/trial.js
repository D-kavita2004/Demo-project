const QualityForm = () => {

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
 
  const clickedForm = location.state?.data;
  const formFromState = clickedForm?.formData;  //preview existing data
  const myDefaultData = formFromState || myData;
  
  const [isNewForm, setIsNewForm] = useState(!clickedForm); 

  const [preview, setPreview] = useState(null); // image preview state

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

useEffect(() => {
  if (isNewForm && productImageFile?.length > 0) {
    const objectUrl = URL.createObjectURL(productImageFile[0]);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }

  setPreview(clickedForm?.formData?.defectivenessDetail?.productImage || null);
}, [productImageFile, isNewForm, clickedForm]);

  // ---------------- ON SUBMIT ----------------
  const onSubmit = async (formData, handler) => {
    try {
      if (handler) {
        await handler(clickedForm?._id, formData);
      } else {
        console.warn("No handler defined for this action");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

const handleApprove = async (id,formData) => {

    try {
      console.log(formData);
      // Call the API to approve the form
      const response = await api.post(
        `${apiUrl}/form/approve`,
        {formId:id,data:formData},
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
const handleReject = async (id,formData) => {
    try {
      // Call the API to reject the form
      const response = await api.post(
        `${apiUrl}/form/reject`,
        {formId:id,data:formData},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form rejected:", response.data);
      navigate("/");
    } catch (error) {
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
          data.append("formData", JSON.stringify(formData));

          const res = await api.post(`${apiUrl}/form/createForm`, data, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          console.log("Form submitted successfully:", res.data);
          navigate("/");
        } 
      catch (err) {
          console.error("Error submitting form:", err);
        }
};
const handleProdResponse = async (id,formData) => {
   try {
      // Call the API to approve the form
      const response = await api.post(
        `${apiUrl}/form/prodResponse`,
        {formId:id,data:formData},
        { withCredentials: true } // if your backend uses cookies
      );

      console.log("Form approved:", response.data);
      navigate("/");
      // Open modal after approval
      setIsOpen(true);
    } catch (error) {
      console.error("Error approving form:", error.response?.data || error);
    } 
}
const handleFinalSubmit = async (id,formData) => {

    try {
      // Call the API to approve the form
      const response = await api.post(
        `${apiUrl}/form/finalSubmit`,
        {formId:id,data:formData},
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
      // Call the API to send production response
const getPrimaryAction = () => {

  // NEW FORM
  if (!clickedForm) {
    return {
      label: "Create New Issue",
      handler: (_, formData) => handleCreateNewIssue(formData),
    };
  }

  const { status } = clickedForm;
  const { flag } = user.team;

  // INTERNAL → send to QA
  if (status === "pending_prod" && flag === "INTERNAL") {
    return {
      label: "Submit",
      handler: (id, formData) => handleProdResponse(id, formData),
    };
  }

  // QA → reject to prod
  if (status === "pending_quality" && flag === "QA") {
    return {
      label: "Reject",
      handler: (id, formData) => handleReject(id, formData),
    };
  }

  // Block actions when user not allowed
  if (
    (status === "pending_prod" && flag === "QA") ||
    (status === "pending_quality" && flag === "INTERNAL")
  ) {
    return null;
  }

  // FINAL SUBMIT AFTER APPROVAL
  if (status === "approved") {
    return {
      label: "Final Submit",
      handler: (id, formData) => handleFinalSubmit(id, formData),
    };
  }

  // DEFAULT SAVE
  return {
    label: "Submit",
    handler: (id, formData) => handleProdResponse(id, formData),
  };
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
        <Card className="max-w-5xl mx-auto mt-8 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-center">
                Product Review Form
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="flex flex-col gap-10 my-6">

              </CardContent>

                <CardFooter className="flex justify-center py-6">

                  {/* Primary dynamic action button */}
                  {primaryAction && (
                    <Button
                      type="submit"
                      className="px-8 py-2 text-lg mx-3"
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
                        onClick={(formData) => handleApprove(clickedForm._id, formData)}
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