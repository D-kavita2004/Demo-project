import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOutIcon } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Admin Panel", route: "/admin" },
    { label: "Reports", route: "/reports" },
    { label: "QC", route: "/qc" },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      
      {/* Left: Dashboard Title */}
      <h1
        className="text-2xl font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => navigate("/")}
      >
        Dashboard
      </h1>

      {/* Right: Navigation */}
      <nav className="flex items-center gap-6">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.route);

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`relative text-sm font-medium transition-colors px-2 py-1 rounded-md
                ${isActive
                  ? "text-white bg-blue-600 shadow-md hover:bg-blue-700"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {item.label}

              {/* Optional active underline */}
              {isActive && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white"></span>
              )}
            </button>
          );
        })}

        {/* Logout */}
        <button
          className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
          onClick={() => {
            // logout logic here
            console.log("Logout");
          }}
        >
          <LogOutIcon className="w-4 h-4" />
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
