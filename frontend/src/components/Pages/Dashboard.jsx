import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../Utils/userContext";
import api from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { FormsContext } from "../Utils/formsContext";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TableView from "../ReusableComponents/TableView";
import DownloadAllRecords from "../ReusableComponents/DownLoadAllRecords";
import { toast } from "sonner";
import { logOutUser } from "@/components/Utils/logout";

const Dashboard = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const {formsList} = useContext(FormsContext)
  const { setUser, user } = useContext(UserContext);

  // Logout handler
const handleLogout = async () => {
  await logOutUser();  // calls backend
  setUser(null);
  toast.success("Logged out");
  navigate("/login");
};

  // Fetch all forms from backend
  // const fetchAllForms = async () => {
  //   try {
  //     const res = await axios.post(
  //       `${apiUrl}/form/allForms`,
  //       { Team: user.team },
  //       { withCredentials: true }
  //     );
  //     setFormsList(res.data.forms || []);
  //   } catch (err) {
  //     console.error("Error fetching forms:", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchAllForms();
  // }, []);

  const filteredForms = formsList.filter((form) => {
    const search = searchTerm.toLowerCase();

    const partName = form.formData?.partName?.toLowerCase() || "";
    const supplier = form.formData?.supplierName?.toLowerCase() || "";
    const status = form.status?.toLowerCase() || "";

    return (
      partName.includes(search) ||
      supplier.includes(search) ||
      status.includes(search)
    );
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">

      {/* Header */}
      <header className="flex justify-between items-start sm:items-center gap-4 mb-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>

        <Button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-md px-5 py-2.5 rounded-lg shadow-lg hover:from-red-600 hover:to-rose-600 hover:scale-105 transition"
        >
          Logout
        </Button>
      </header>

      {/* Welcome Card */}
      <div className="mb-8 w-[80%] mx-auto">
        <div className="w-full">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="text-gray-800 dark:text-gray-100 text-2xl italic font-medium">
              Welcome {user?.username || "User"} 👋
            </div>

            <div className="flex gap-2 justify-evenly">
             {
              user && user?.role === "admin" && (
                 <Button variant="outline" onClick={()=>navigate("/Admin")} className="border-2 text-md">
                    Admin Panel
                 </Button>
              )
             }

              <Button variant="outline" onClick={()=>navigate("/Reports")} className="border-2 text-md">
                Reports
              </Button>

              {user && (user?.team === "QA" || user?.role === "admin") && (
                <Button
                  onClick={() => navigate("/Quality-Form")}
                  variant="outline"
                  className="border-2 text-md"
                >
                  QC Form
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Forms Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg w-full">
        <CardContent className="p-4 sm:p-6 w-full">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
              Forms
            </h2>

            <Input
              type="text"
              placeholder="Search by Part Name, Supplier, Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-full sm:max-w-sm bg-white dark:bg-gray-800"
            />
          </div>

          <Button
            className="mb-5"
            onClick={() => {
              const list = formsList.map((obj) => obj.formData);
              DownloadAllRecords(list);
            }}
          >
            Download All Records
          </Button>

          {/* Table wrapped to avoid overflow */}
          <div className="w-full overflow-x-auto">
            <TableView data={filteredForms} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
