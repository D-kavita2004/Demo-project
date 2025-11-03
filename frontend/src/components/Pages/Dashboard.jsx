import React, { useContext } from "react";
import { UserContext } from "../Constants/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { setUser,user } = useContext(UserContext);
  console.log("Dashboard",user);
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

  // Navigate to Quality Form
  const goToQualityForm = () => {
    navigate("/Quality-Form");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex gap-4">
      {
            user.team === "Quality" && (
            <button
            onClick={goToQualityForm}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
            >
            Quality Check Form
            </button>
            )
      }
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Welcome
        </h2>

      </div>


    </div>
  );
};

export default Dashboard;
