import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";
import "../styles/login.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@hub.com" && password === "admin123") {
      localStorage.setItem("currentUser", JSON.stringify({ role: "admin", email }));
      navigate("/admin-dashboard");
    } else {
      alert("Invalid Admin Credentials");
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
        <div className="auth-icon" style={{ color: "var(--danger)" }}>
          <FaUserShield />
        </div>
        <h1>Admin Portal</h1>
        <p className="auth-subtitle">Authorized personnel only.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@hub.com"
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
            <button type="submit" className="btn-primary" style={{ background: "var(--danger)" }}>
              Access Dashboard
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

export default AdminLogin;