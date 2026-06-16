import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/login.css";

function ClubLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (res.data.user.role === "club") {
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        navigate("/club-dashboard");
      } else {
        alert("This portal is for club representatives only");
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
        <div className="auth-icon" style={{ color: "var(--secondary)" }}>
          <FaUsers />
        </div>
        <h1>Club Portal</h1>
        <p className="auth-subtitle">Login to manage your club and events.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Club Email</label>
            <input
              type="email"
              placeholder="club@university.edu"
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
            <button type="submit" className="btn-primary" style={{ background: "var(--gradient-text)" }}>
              Login
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/register")}
            >
              Register New Club
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default ClubLogin;