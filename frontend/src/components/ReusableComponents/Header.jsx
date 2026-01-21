import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOutIcon } from "lucide-react";
import { logOutUser } from "../Utils/logout";
import { useContext } from "react";
import { UserContext } from "../Utils/userContext";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const { setUser, user } = useContext(UserContext);

  const handleLogout = async () => {
  await logOutUser();  // calls backend
  setUser(null);
  toast.success("Logged out");
  navigate("/login");
  };

  const navItems = [
    user && user.role==="admin" && { label: "Admin Panel", route: "/admin" },
    { label: "Reports", route: "/reports" },
    user && user.team.flag==="QA" && { label: "QC", route: "/Quality-Form" },
  ];

  return (
   <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 px-4 sm:px-6 py-3">
  <div className="flex items-center justify-between flex-wrap gap-3">

    {/* Left: Dashboard */}
    <h1
      className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
      onClick={() => navigate("/")}
    >
      Dashboard
    </h1>

    {/* Right: Navigation */}
    <nav className="flex items-center gap-2 sm:gap-6 flex-wrap">

      {navItems.map(
        (item) =>
          item && (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="text-sm sm:text-base font-medium px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {item.label}
            </button>
          )
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-sm sm:text-base font-medium text-red-600 dark:text-red-400 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition"
      >
        <LogOutIcon className="w-4 h-4" />
        Logout
      </button>

    </nav>
  </div>
</header>

  );
};

export default Header;
