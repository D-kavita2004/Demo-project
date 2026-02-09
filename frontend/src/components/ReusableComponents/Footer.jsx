import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">

        {/* Left Section */}
        <p className="text-center md:text-left">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-700">
            Copyright
          </span>
          . All rights reserved.
        </p>
        {/* Right Section */}
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-600">
            v1.0.0
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
