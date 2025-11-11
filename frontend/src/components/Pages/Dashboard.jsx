import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../Constants/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { WorkflowChart } from "../ReusableComponents/ChartComponent";
import  DepartmentPieChart  from "../ReusableComponents/DepartmentPieChart";
import FormsBarChart from "../ReusableComponents/FormsBarChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TableView from "../ReusableComponents/TableView";

const Dashboard = () => {
  const [formsList, setFormsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { setUser, user } = useContext(UserContext);
  const navigate = useNavigate();

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
      console.log(res.data.forms);
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
    partName.includes(search) || supplier.includes(search) || status.includes(search)
  );
});

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <div className="flex gap-4">
          {user?.team === "Quality" && (
            <Button
              onClick={() => navigate("/Quality-Form")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-600 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Quality Check Form
            </Button>
          )}
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg hover:from-red-600 hover:to-rose-600 transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Logout
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

      {/* Search Input */}
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Forms
        </h2>
        <Input
          type="text"
          placeholder="Search by Part Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white dark:bg-gray-800"
        />
      </div> */}

      {/* Forms Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Forms
            </h2>
            <Input
              type="text"
              placeholder="Search by Part Name, Supplier, Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white dark:bg-gray-800"
            />
          </div>

          <TableView
            data={filteredForms}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
