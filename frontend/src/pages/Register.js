import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, password, role };
      if (role === "club") {
        payload.clubName = clubName;
        payload.collegeName = collegeName;
      } else if (role === "student") {
        payload.rollNumber = rollNumber;
        payload.mobileNumber = mobileNumber;
      }
      
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      alert(res.data.message || "Registered Successfully! Please Login.");
      navigate(role === "student" ? "/student-login" : "/club-login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
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
        <div className="auth-icon" style={{ color: "var(--accent)" }}>
          <FaUserPlus />
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join Campus Hub today.</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>I am a...</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="club">Club Representative</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {role === "student" && (
            <>
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. CS2026101"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {role === "club" && (
            <>
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  placeholder="Tech Club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>College Name</label>
                <input
                  type="text"
                  placeholder="e.g. State University"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

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
            <button type="submit" className="btn-primary" style={{ background: "var(--accent)", color: "#000" }}>
              Sign Up
            </button>
            <p className="auth-footer">
              Already have an account?{" "}
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

export default Register;