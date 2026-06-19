import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "../styles/login.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "teamcampushub" && password === "csaif3") {
      sessionStorage.setItem("currentUser", JSON.stringify({ role: "admin", email: username }));
      toast.success("Welcome back, Administrator!");
      navigate("/admin-dashboard");
    } else {
      toast.error("Invalid Admin Credentials");
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
            <label>Admin Username</label>
            <input
              type="text"
              placeholder="e.g. teamcampushub"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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