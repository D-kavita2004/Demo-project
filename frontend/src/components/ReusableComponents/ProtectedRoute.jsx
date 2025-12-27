import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../Utils/userContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login"/>;
  }
  // console.log(user);
  return children;
};

export default ProtectedRoute;
