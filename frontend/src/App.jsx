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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reports"
          element={
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
         <Route path="*" element={<ErrorPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
