import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QualityForm from "./components/Pages/QualityForm";
import Login from "./components/Pages/Login";
import Signup from "./components/Pages/Signup";
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes*/}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        {/* Protected route */}

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
          path="/Admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Use relative paths, no leading slash */}
          <Route path="" element={<ProtectedRoute><AdminFeaturesOverview/></ProtectedRoute>} />
          {/* <Route path="Overview" element={<ProtectedRoute><AdminFeaturesOverview/></ProtectedRoute>} /> */}
          <Route path="Users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
          <Route path="Suppliers" element={<ProtectedRoute><Suppliers/></ProtectedRoute>} />
          <Route path="Parts" element={<ProtectedRoute><PartNames/></ProtectedRoute>} />
          <Route path="Processes" element={<ProtectedRoute><ProcessNames/></ProtectedRoute>} />
          <Route path="Machines" element={<ProtectedRoute><MachineNames/></ProtectedRoute>} />
        </Route>

        <Route
          path="/Quality-Form"
          element={
            <ProtectedRoute>
              <QualityForm />
            </ProtectedRoute>
          }
        />
         <Route path="*" element={<ErrorPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
