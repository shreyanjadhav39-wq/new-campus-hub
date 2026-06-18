import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaUsersCog, FaSignOutAlt, FaChartLine, FaTrashAlt, FaGraduationCap, FaSchool, FaBookOpen, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      const [usersRes, eventsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/users`),
        axios.get(`${API_BASE_URL}/api/events`),
        axios.get(`${API_BASE_URL}/api/bookings`)
      ]);
      setUsersList(usersRes.data);
      setEventsList(eventsRes.data);
      setBookingsList(bookingsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`);
        toast.success("User deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete user");
        console.error(err);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This will also delete all bookings for this event!")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
        toast.success("Event deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete event");
        console.error(err);
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete/void this booking?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`);
        toast.success("Booking deleted/voided successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete booking");
        console.error(err);
      }
    }
  };

  const handleResetSystemData = async () => {
    if (window.confirm("WARNING: This will permanently clear ALL events and bookings from the database! Are you sure you want to do this?")) {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/reset-db`);
        toast.success("Database events and bookings cleared successfully! System has been reset.");
        fetchData();
      } catch (err) {
        toast.error("Failed to clear database");
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

  const approvedBookings = bookingsList.filter(b => b.status === "Approved");
  const totalSystemRevenue = approvedBookings.reduce((sum, b) => sum + (b.eventPrice || 0), 0);

  const getFilteredBookings = () => {
    return bookingsList.filter(b => {
      const q = searchQuery.toLowerCase();
      return b.studentName?.toLowerCase().includes(q) ||
             b.eventName?.toLowerCase().includes(q) ||
             b.studentCollegeName?.toLowerCase().includes(q) ||
             b.bookingId?.toLowerCase().includes(q);
    });
  };

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

      <div className="dashboard-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
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

        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--accent)" }}>
            <FaBookOpen />
          </div>
          <div className="stat-info">
            <h3>{bookingsList.length}</h3>
            <p>Total Bookings ({approvedBookings.length} Approved)</p>
          </div>
        </motion.div>

        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--success)" }}>
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>₹{totalSystemRevenue}</h3>
            <p>Overall System Revenue</p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* User Accounts Panel */}
        <div className="dashboard-panel glass-panel">
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
                    <th style={{ padding: "12px 8px" }}>Registered Details</th>
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
                      <td style={{ padding: "12px 8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {u.role === "club" ? (
                          u.collegeName ? `🏫 ${u.collegeName}` : "N/A"
                        ) : (
                          <span>
                            {u.collegeName ? `🏫 ${u.collegeName}` : ""}
                            {u.rollNumber ? ` | Roll: ${u.rollNumber}` : ""}
                            {u.mobileNumber ? ` | Mob: ${u.mobileNumber}` : ""}
                            {!u.collegeName && !u.rollNumber && !u.mobileNumber ? "N/A" : ""}
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

        {/* System Events Panel */}
        <div className="dashboard-panel glass-panel" style={{ marginTop: "20px" }}>
          <h2>System Events</h2>
          {eventsList.length === 0 ? (
            <div className="empty-state">
              <p>No events found in the system.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "10px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <th style={{ padding: "12px 8px" }}>Event Title</th>
                    <th style={{ padding: "12px 8px" }}>Club Name</th>
                    <th style={{ padding: "12px 8px" }}>College</th>
                    <th style={{ padding: "12px 8px" }}>Venue & Date</th>
                    <th style={{ padding: "12px 8px" }}>Seats</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsList.map((e) => (
                    <tr key={e._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 8px", fontWeight: "bold", color: "var(--primary)" }}>{e.title}</td>
                      <td style={{ padding: "12px 8px" }}>{e.clubName}</td>
                      <td style={{ padding: "12px 8px", color: "var(--accent)" }}>{e.collegeName || "N/A"}</td>
                      <td style={{ padding: "12px 8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {e.venue} | {e.date}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "0.85rem" }}>
                        {e.seatsLeft} / {e.seats}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <button 
                          onClick={() => handleDeleteEvent(e._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--danger)",
                            cursor: "pointer",
                            padding: "6px"
                          }}
                          title="Delete Event"
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

        {/* System Bookings Panel */}
        <div className="dashboard-panel glass-panel" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, padding: 0, border: "none" }}>System Bookings ({getFilteredBookings().length})</h2>
            <input
              type="text"
              placeholder="Search by student, college, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "8px 12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--text-main)", outline: "none", minWidth: "250px" }}
            />
          </div>
          
          {getFilteredBookings().length === 0 ? (
            <div className="empty-state">
              <p>No bookings found in the system.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "10px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <th style={{ padding: "12px 8px" }}>Attendee</th>
                    <th style={{ padding: "12px 8px" }}>Student College</th>
                    <th style={{ padding: "12px 8px" }}>Event Info</th>
                    <th style={{ padding: "12px 8px" }}>Price</th>
                    <th style={{ padding: "12px 8px" }}>Status</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBookings().map((b) => (
                    <tr key={b._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <strong style={{ color: "var(--text-main)", display: "block" }}>{b.studentName}</strong>
                        <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontFamily: "monospace" }}>ID: {b.bookingId || "N/A"}</span>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><FaSchool style={{ color: "var(--primary)" }} /> {b.studentCollegeName || "N/A"}</span>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "0.85rem" }}>
                        <strong style={{ color: "var(--primary)" }}>{b.eventName}</strong>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Host: {b.clubId}</div>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "0.85rem" }}>₹{b.eventPrice || 0}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ 
                          background: b.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : b.status === "Rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: b.status === "Approved" ? "var(--success)" : b.status === "Rejected" ? "var(--danger)" : "orange",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "bold"
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <button 
                          onClick={() => handleDeleteBooking(b._id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--danger)",
                            cursor: "pointer",
                            padding: "6px"
                          }}
                          title="Delete Booking"
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

        {/* Danger Zone Reset Panel */}
        <div className="dashboard-panel glass-panel" style={{ marginTop: "20px", border: "1px solid var(--danger)" }}>
          <h2 style={{ color: "var(--danger)" }}>⚠️ Danger Zone</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
            Perform critical system administration actions. Wiping system data will help set up a clean slate for deployment.
          </p>
          <button 
            className="btn-primary" 
            style={{ background: "var(--danger)", color: "#fff", width: "auto", padding: "10px 20px" }}
            onClick={handleResetSystemData}
          >
            Reset System Data (Wipe Events & Bookings)
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;