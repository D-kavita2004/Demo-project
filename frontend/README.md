import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../Constants/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { WorkflowChart } from "../ReusableComponents/Charts/ChartComponent";
import DepartmentPieChart from "../ReusableComponents/Charts/DepartmentPieChart";
import FormsBarChart from "../ReusableComponents/Charts/FormsBarChart";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TableView from "../ReusableComponents/TableView";
import DownloadAllRecords from "../ReusableComponents/DownLoadAllRecords";

const Dashboard = () => {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  
  const [formsList, setFormsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { setUser, user } = useContext(UserContext);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.get(`${apiUrl}/auth/logout`, {
        withCredentials: true,
      });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    }
  };

  // Fetch all forms from backend
  const fetchAllForms = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/form/allForms`,
        { Team: user.team },
        { withCredentials: true }
      );
      console.log(res.data);
      setFormsList(res.data.forms || []);
    } catch (err) {
      console.error("Error fetching forms:", err);
    }
  };

  useEffect(() => {
    fetchAllForms();
  }, []);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>

        {/* Buttons Container */}
        <div className="flex flex-wrap justify-start sm:justify-end gap-3 w-full sm:w-auto">
          {user?.team === "Quality" && (
            <Button
              onClick={() => navigate("/Quality-Form")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium px-4 sm:px-5 py-2.5 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-600 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Quality Check Form
            </Button>
          )}
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium px-4 sm:px-5 py-2.5 rounded-lg shadow-lg hover:from-red-600 hover:to-rose-600 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Logout
          </Button>
          <Button
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium px-4 sm:px-5 py-2.5 rounded-lg shadow-lg hover:from-red-600 hover:to-rose-600 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Admin Panel
          </Button>
          <Button
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium px-4 sm:px-5 py-2.5 rounded-lg shadow-lg hover:from-red-600 hover:to-rose-600 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Reports
          </Button>
        </div>
      </header>

      {/* Welcome Card */}
      <Card className="bg-white dark:bg-gray-800 mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100">
            Welcome {user?.username || "User"} 👋
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Chart Section */}
      <div className="my-7 flex flex-col gap-7">
        {/* Workflow chart full width */}
        <div className="w-full">
          <WorkflowChart />
        </div>

        {/* Side-by-side charts */}
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <DepartmentPieChart />
          </div>
          <div className="w-full md:w-1/2">
            <FormsBarChart />
          </div>
        </div>
      </div>

      {/* Forms Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
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
          <Button className="mb-5" onClick={()=>
            {
              const list = formsList.map((obj)=> obj.formData);
              console.log(list);
              DownloadAllRecords(list);
            }
            }>Download All Records</Button>

          <TableView data={filteredForms} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
