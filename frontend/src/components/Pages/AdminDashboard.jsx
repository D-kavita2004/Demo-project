import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import { navcards as cards} from "../Utils/DefaultData";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "../ReusableComponents/Header";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { label: "Admin Panel", route: "/admin" },
    { label: "Reports", route: "/reports" },
    { label: "QC", route: "/qc" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`lg:static shrink-0 fixed top-0 lg:w-64 z-30 bg-white shadow-lg h-screen transition-all duration-300 
        ${sidebarOpen ? "w-64" : "w-0"} overflow-y-scroll`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span
            className={`text-xl font-bold text-gray-800 whitespace-nowrap transition-all
            ${sidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
            
          >
            Admin Panel
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <MenuIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="mt-6 flex flex-col gap-2 px-2">
          {cards.map((card) => {
            const isActive = location.pathname === `/Admin/${card.route}`;
            console.log("Current Path:", location.pathname, "Card Route:", card.route);
            return (
              <button
              key={card.id}
              className={`flex items-center gap-4 p-2 hover:bg-gray-100 transition rounded-md ${
            isActive
              ? "bg-blue-600 text-white shadow-md hover:text-black"
              : "text-gray-700 hover:bg-gray-100"
          }`}
              onClick={() => {
                navigate(card.route);
                setSidebarOpen(false);
              }}
            >
              <div className="p-2 rounded-full bg-gray-200 flex items-center justify-center">
                {card.icon}
              </div>
              <span
                className={`font-medium transition-all duration-300
                ${sidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
              >
                {card.title}
              </span>
            </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
              
              {/* Left: Dashboard Title */}
              <div className="flex items-center gap-4 cursor-pointer">
                <button
                  className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <MenuIcon className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800" onClick={()=>navigate("/")}>Dashboard</h1>
              </div>

        
              {/* Right: Navigation */}
              <nav className="flex items-center gap-6">
                <button
                      key="Reports"
                      onClick={() => navigate("/reports")}
                      className={`relative text-lg font-medium transition-colors px-2 py-1 rounded-md cursor-pointer
                        `}
                    >
                      Reports
  
                </button>
        
                {/* Logout */}
                <button
                  className="flex items-center gap-1 text-lg font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer"
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

        {/* Cards Grid */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto max-w-screen items-center ">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
