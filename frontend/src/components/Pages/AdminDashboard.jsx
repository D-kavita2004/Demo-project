import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import { navcards as cards} from "../Utils/DefaultData";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          {cards.map((card) => (
            <button
              key={card.id}
              className="flex items-center gap-4 p-3 hover:bg-gray-100 transition rounded-md"
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
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800" onClick={()=>navigate("/")}>Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium hidden sm:block">
              Admin
            </span>
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-10 h-10 rounded-full border border-gray-200"
            />
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <LogOutIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
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
