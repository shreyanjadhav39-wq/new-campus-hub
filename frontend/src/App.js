import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import ClubLogin from "./pages/ClubLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import ClubDashboard from "./pages/ClubDashboard";
import ClubEventDetails from "./pages/ClubEventDetails";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";

function App() {
  useEffect(() => {
    // 1. Analytics Visitor Tracking
    const trackVisitor = async () => {
      try {
        const hasVisitedThisSession = sessionStorage.getItem("hasVisitedThisSession");
        const isNewSession = !hasVisitedThisSession;
        if (isNewSession) {
          sessionStorage.setItem("hasVisitedThisSession", "true");
        }
        await axios.post(`${API_BASE_URL}/api/auth/track-visit`, { isNewSession });
      } catch (err) {
        console.error("Failed to log visit analytics", err);
      }
    };
    trackVisitor();

    // 2. Heartbeat Ping Timer
    const runHeartbeat = async () => {
      try {
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        if (currentUser && currentUser._id && currentUser.role !== "admin") {
          await axios.post(`${API_BASE_URL}/api/auth/heartbeat`, { userId: currentUser._id });
        }
      } catch (err) {
        console.error("Heartbeat fail", err);
      }
    };

    // run initially and then every 30 seconds
    runHeartbeat();
    const interval = setInterval(runHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <HashRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: "#1e293b", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.08)" } }} />
      <div className="page-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/club-login" element={<ClubLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/student-dashboard" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/club-dashboard" element={
              <ProtectedRoute allowedRoles={["club"]}>
                <ClubDashboard />
              </ProtectedRoute>
            } />
            <Route path="/club/event/:id" element={
              <ProtectedRoute allowedRoles={["club"]}>
                <ClubEventDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/booking" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <BookingPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;