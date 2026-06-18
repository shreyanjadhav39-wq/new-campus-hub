import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
  return (
    <BrowserRouter>
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
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/club-dashboard" element={<ClubDashboard />} />
            <Route path="/club/event/:id" element={<ClubEventDetails />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/booking" element={<BookingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;