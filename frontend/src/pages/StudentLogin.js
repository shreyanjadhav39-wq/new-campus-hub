import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserGraduate } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/login.css";

function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (res.data.user.role === "student") {
        sessionStorage.setItem("currentUser", JSON.stringify(res.data.user));
        sessionStorage.setItem("token", res.data.token);
        navigate("/student-dashboard");
      } else {
        alert("This portal is for students only");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card glass-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-icon">
          <FaUserGraduate />
        </div>
        <h1>Student Portal</h1>
        <p className="auth-subtitle">Welcome back! Please login to your account.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-primary">
              Login
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
            <p className="auth-footer" style={{ marginTop: "15px", width: "100%", textAlign: "center" }}>
              <span className="auth-link" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </span>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default StudentLogin;