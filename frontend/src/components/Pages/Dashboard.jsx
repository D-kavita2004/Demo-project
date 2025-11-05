import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../Constants/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { WorkflowChart } from "../ReusableComponents/ChartComponent";
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

const Dashboard = () => {
  const [formsList, setFormsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { setUser, user } = useContext(UserContext);
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout", {
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
        "http://localhost:3000/form/allForms",
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

  const filteredForms = formsList.filter((form) =>
    form.formData.partName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex gap-4">
          {user?.team === "Quality" && (
            <Button
              onClick={() => navigate("/Quality-Form")}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              Quality Check Form
            </Button>
          )}
          <Button
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 shadow"
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
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Here’s an overview of your submitted forms and their statuses.
          </p>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <div className="my-7">
        <WorkflowChart />
      </div>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Submitted Forms
        </h2>
        <Input
          type="text"
          placeholder="Search by Part Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white dark:bg-gray-800"
        />
      </div>

      {/* Forms Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardContent className="p-0">
          {filteredForms.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No forms found matching your search.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left font-bold">Part Name</TableHead>
                    <TableHead className="text-left font-bold">Status</TableHead>
                    <TableHead className="text-left font-bold">Supplier Name</TableHead>
                    <TableHead className="text-left font-bold">Date</TableHead>
                    <TableHead className="text-right font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow
                      key={form._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <TableCell className="font-medium text-gray-800 dark:text-gray-100">
                        {form.formData.partName || "Untitled"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            form.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : form.status === "pending_prod"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {form.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {form.formData.supplierName}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => {
                            const selectedForm = formsList.find(
                              (f) => f._id === form._id
                            );
                            navigate("/Quality-Form", {
                              state: { data: selectedForm },
                            });
                          }}
                          className={`${
                            form.status === "approved"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white`}
                        >
                          {form.status === "approved"
                            ? "View Details"
                            : user.team === form.filledBy
                            ? "Submitted"
                            : "Preview"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
