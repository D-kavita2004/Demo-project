import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  BarChartIcon,
  BellIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react";

const cards = [
  {
    id: 1,
    title: "Users",
    icon: <UsersIcon className="w-6 h-6 text-white" />,
    route: "/users",
    color: "from-blue-500 to-blue-600",
    stat: 120,
  },
  {
    id: 2,
    title: "Documents",
    icon: <FileTextIcon className="w-6 h-6 text-white" />,
    route: "/documents",
    color: "from-green-500 to-green-600",
    stat: 340,
  },
  {
    id: 3,
    title: "Reports",
    icon: <BarChartIcon className="w-6 h-6 text-white" />,
    route: "/reports",
    color: "from-purple-500 to-purple-600",
    stat: 24,
  },
  {
    id: 4,
    title: "Notifications",
    icon: <BellIcon className="w-6 h-6 text-white" />,
    route: "/notifications",
    color: "from-yellow-400 to-yellow-500",
    stat: 5,
  },
  {
    id: 5,
    title: "Settings",
    icon: <SettingsIcon className="w-6 h-6 text-white" />,
    route: "/settings",
    color: "from-pink-500 to-pink-600",
    stat: null,
  },


];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        className={`lg:static fixed top-0 lg:w-64 z-30 bg-white shadow-lg h-screen transition-all duration-300 
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
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card
                key={card.id}
                className="cursor-pointer transform hover:scale-[1.03] transition-all duration-300 shadow-sm hover:shadow-xl backdrop-blur-sm"
                onClick={() => navigate(card.route)}
              >
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-full bg-gradient-to-br ${card.color} shadow-md`}
                    >
                      {card.icon}
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-semibold">
                      {card.title}
                    </CardTitle>
                  </div>

                  {card.stat !== null && (
                    <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                      {card.stat}
                    </span>
                  )}
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Click to manage {card.title.toLowerCase()} efficiently.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
