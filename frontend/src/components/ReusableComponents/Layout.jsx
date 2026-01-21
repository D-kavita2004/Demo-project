import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../ReusableComponents/Header";
import Footer from "../ReusableComponents/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Top Navbar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <Outlet /> {/* Nested routes render here */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
