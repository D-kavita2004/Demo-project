import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../Constants/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Dashboard = () => {
  const [formsList, setFormsList] = useState([]);
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
      const res = await axios.get("http://localhost:3000/form/allForms", {
        withCredentials: true,
      });
      setFormsList(res.data.forms || []);
      console.log(res.data.forms);
    } catch (err) {
      console.error("Error fetching forms:", err);
    }
  };

  // Navigate to Quality Form
  const goToQualityForm = () => {
    navigate("/Quality-Form");
  };

  useEffect(() => {
    fetchAllForms();
  }, []);

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
              onClick={goToQualityForm}
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Welcome {user?.username || "User"} 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here’s an overview of your submitted forms.
        </p>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        {formsList.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No forms found.
          </p>
        ) : (
          formsList.map((form) => (
            <div
              key={form._id}
              className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                  {form.formData.partName || "Untitled Form"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status: {form.status}
                </p>
              </div>
              <Button
                onClick={() => {
                        // find the clicked form from the list
                        const selectedForm = formsList.find((f) => f._id === form._id);
                        console.log(selectedForm);
                        // navigate and pass form data as state
                        navigate("/Quality-Form", { state: { data: selectedForm } });
                  }}
                className={`${
                  form.status === "pending_prod"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {user.team === form.filledBy ? "Submitted" : "Preview"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
