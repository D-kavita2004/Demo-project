import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-6">
      
      <div className="text-center max-w-md">
        
        {/* Illustration */}
        <div className="relative flex justify-center mb-8">
          <div className="absolute inset-0 blur-2xl bg-blue-300/30 rounded-full"></div>
          <div className="relative p-6 bg-white shadow-xl rounded-full border border-gray-200">
            <Ghost className="h-14 w-14 text-indigo-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-gray-800 mb-3 tracking-tight">
          404
        </h1>

        <p className="text-xl font-semibold text-gray-700 mb-2">
          Page Not Found
        </p>

        <p className="text-gray-500 mb-8">
          The page you are looking for doesn’t exist, or it may have been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/">
            <Button className="w-full py-5 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition">
              Go to Homepage
            </Button>
          </Link>

          <Link to="/login">
            <Button
              variant="outline"
              className="w-full py-5 text-lg font-medium rounded-xl border-gray-300 hover:bg-gray-100"
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
