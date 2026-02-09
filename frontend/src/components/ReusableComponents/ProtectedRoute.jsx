import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../Utils/userContext";
import ErrorPage from "../Pages/ErrorPage";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Logged in but doesn't have required role → show error page
    return <ErrorPage msg="You do not have permission to access Admin Dashboard." />;
  }

  return children;
};

export default ProtectedRoute;



// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { UserContext } from "../Utils/userContext";

// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useContext(UserContext);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (!user) {
//     return <Navigate to="/login"/>;
//   }
//   // console.log(user);
//   return children;
// };

// export default ProtectedRoute;
