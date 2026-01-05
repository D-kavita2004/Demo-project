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
      resolver:zodResolver(formDataSchema)
    });

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

const productImageFile = watch("defectivenessDetail.productImage");

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

  
const getPrimaryAction = () => {
  if (!clickedForm) {    // New form
    return {
      label: "Submit",
      handler: () => handleSubmit(clickedForm?._id),
    };
  }

  const { status } = clickedForm;
  const { flag } = user.team;

  // INTERNAL — send to QA
  if (status === "pending_prod" && flag === "INTERNAL") {
    return {
      label: "Submit",
      handler: () => handleSubmit(clickedForm._id),
    };
  }

  // QA — reject back to prod
  if (status === "pending_quality" && flag === "QA") {
    return {
      label: "Reject",
      handler: () => handleReject(clickedForm._id),
    };
  }

  // After approval — final submission
  if (status === "approved") {
    return {
      label: "Final Submit",
      handler: () => handleFinalize(clickedForm._id),
    };
  }

  // Default submit
  return {
    label: "Submit",
    handler: () => handleSubmit(clickedForm._id),
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