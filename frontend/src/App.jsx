import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QualityForm from "./components/Pages/QualityForm";
import Login from "./components/Pages/Login";
import ProtectedRoute from "./components/ReusableComponents/ProtectedRoute";
import Dashboard from "./components/Pages/Dashboard";
import ResetPassword from "./components/Pages/ResetPassword";
import ForgotPassword from "./components/Pages/ForgotPassword";
import ErrorPage from "./components/Pages/ErrorPage";
import Reports from "./components/Pages/Reports";
import AdminDashboard from "./components/Pages/AdminDashboard";
import UsersManagement from "./components/Pages/UsersManagement";
import Suppliers from "./components/Pages/Suppliers";
import PartNames from "./components/Pages/PartNames";
import ProcessNames from "./components/Pages/ProcessNames";
import MachineNames from "./components/Pages/MachineNames";
import AdminFeaturesOverview from "./components/Pages/AdminFeaturesOverview";
import { useContext } from "react";
import { UserContext } from "./components/Utils/userContext";
import Layout from "./components/ReusableComponents/Layout";

function App() {
  const {user,loading} = useContext(UserContext);
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes*/}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        {/* Protected route */}

        <Route path="/"  element={<ProtectedRoute><Layout/></ProtectedRoute>}>
            <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Reports" element={
                <ProtectedRoute>
                  <Reports/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Quality-Form"
              element={
                <ProtectedRoute>
                  <QualityForm />
                </ProtectedRoute>
              }
            />
        </Route>

         <Route
            path="/Admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<AdminFeaturesOverview/>} />
            <Route path="Users" element={<UsersManagement />} />
            <Route path="Suppliers" element={<Suppliers/>} />
            <Route path="Parts" element={<PartNames/>} />
            <Route path="Processes" element={<ProcessNames/>} />
            <Route path="Machines" element={<MachineNames/>} />
            </Route>


        {/* {
          user && user.role === "admin" && (
            <Route
            path="/Admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<AdminFeaturesOverview/>} />
            <Route path="Users" element={<UsersManagement />} />
            <Route path="Suppliers" element={<Suppliers/>} />
            <Route path="Parts" element={<PartNames/>} />
            <Route path="Processes" element={<ProcessNames/>} />
            <Route path="Machines" element={<MachineNames/>} />
            </Route>
          )
        } */}

        {/* {
          user && (user.team.flag === "QA" || user.role === "admin") && (
          <Route
          path="/Quality-Form"
          element={
            <ProtectedRoute>
              <QualityForm />
            </ProtectedRoute>
          }
        />
          )
        } */}
         
         <Route path="*" element={<ErrorPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
