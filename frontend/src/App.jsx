import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QualityForm from "./components/Pages/QualityForm";
import Login from "./components/Pages/Login";
import Signup from "./components/Pages/Signup";
import ProtectedRoute from "./components/ReusableComponents/ProtectedRoute";
import Dashboard from "./components/Pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/form" element={<QualityForm />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected route */}
        <Route
          path="/Quality-Form"
          element={
            <ProtectedRoute>
              <QualityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
