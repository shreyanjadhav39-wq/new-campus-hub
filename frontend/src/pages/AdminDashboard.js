import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaUsersCog, FaSignOutAlt, FaChartLine, FaTrashAlt, FaGraduationCap } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/admin-login");
    } else {
      setUser(currentUser);
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/users`),
        axios.get(`${API_BASE_URL}/api/events`)
      ]);
      setUsersList(usersRes.data);
      setEventsList(eventsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`);
        alert("User deleted successfully!");
        fetchData();
      } catch (err) {
        alert("Failed to delete user");
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  const totalClubs = usersList.filter(u => u.role === "club").length;
  const totalStudents = usersList.filter(u => u.role === "student").length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Admin Portal</h1>
          <p>System Overview & Management</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--danger)" }}>
            <FaUsersCog />
          </div>
          <div className="stat-info">
            <h3>{usersList.length}</h3>
            <p>Total Users ({totalStudents} Students, {totalClubs} Clubs)</p>
          </div>
        </motion.div>
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--primary)" }}>
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>{eventsList.length}</h3>
            <p>System Events</p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel glass-panel" style={{ gridColumn: "1 / -1" }}>
          <h2>User Accounts</h2>
          {usersList.length === 0 ? (
            <div className="empty-state">
              <FaUserShield />
              <p>No user accounts found in the system.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "10px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <th style={{ padding: "12px 8px" }}>Name / Club Name</th>
                    <th style={{ padding: "12px 8px" }}>Email</th>
                    <th style={{ padding: "12px 8px" }}>Role</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        {u.role === "club" ? (
                          <span>
                            <FaUsersCog style={{ marginRight: "6px", color: "var(--secondary)" }} />
                            {u.clubName || u.name}
                          </span>
                        ) : (
                          <span>
                            <FaGraduationCap style={{ marginRight: "6px", color: "var(--primary)" }} />
                            {u.name}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>{u.email}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ 
                          background: u.role === "club" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                          color: u.role === "club" ? "var(--secondary)" : "var(--primary)",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          textTransform: "uppercase"
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--danger)",
                            cursor: "pointer",
                            padding: "6px"
                          }}
                          title="Delete User"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;