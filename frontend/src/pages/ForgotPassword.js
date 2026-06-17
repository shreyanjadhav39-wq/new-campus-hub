import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaKey } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/login.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email,
        name,
        newPassword
      });
      alert(res.data.message || "Password reset successfully!");
      navigate("/student-login");
    } catch (err) {
      alert(err.response?.data?.message || "Password reset failed");
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
        <div className="auth-icon" style={{ color: "var(--primary)" }}>
          <FaKey />
        </div>
        <h1>Reset Password</h1>
        <p className="auth-subtitle">Verify your details to set a new password.</p>

        <form className="auth-form" onSubmit={handleReset}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Registered Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-primary" style={{ background: "var(--accent)", color: "#000" }}>
              Reset Password
            </button>
            <p className="auth-footer">
              Remember your password?{" "}
              <span className="auth-link" onClick={() => navigate("/student-login")}>
                Login here
              </span>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
