import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTicketAlt, FaHistory, FaSignOutAlt, FaRegCalendarTimes, FaDownload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/dashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [sortBy, setSortBy] = useState("dateDesc");
  const [filterStatus, setFilterStatus] = useState("all");

  const getSortedBookings = () => {
    let list = [...bookings];
    
    // Apply status filter
    if (filterStatus !== "all") {
      list = list.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Apply sorting
    list.sort((a, b) => {
      if (sortBy === "dateDesc") {
        return new Date(b.eventDate || 0) - new Date(a.eventDate || 0);
      } else if (sortBy === "dateAsc") {
        return new Date(a.eventDate || 0) - new Date(b.eventDate || 0);
      } else if (sortBy === "nameAsc") {
        return (a.eventName || "").localeCompare(b.eventName || "");
      } else if (sortBy === "nameDesc") {
        return (b.eventName || "").localeCompare(a.eventName || "");
      } else if (sortBy === "priceAsc") {
        return (a.eventPrice || 0) - (b.eventPrice || 0);
      } else if (sortBy === "priceDesc") {
        return (b.eventPrice || 0) - (a.eventPrice || 0);
      }
      return 0;
    });

    return list;
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "student") {
      navigate("/student-login");
    } else {
      setUser(currentUser);
      fetchBookings(currentUser._id);
      fetchRecommendations(currentUser._id);
    }
  }, [navigate]);

  const fetchBookings = async (studentId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings/student/${studentId}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async (studentId) => {
    setLoadingRecommendations(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events/recommendations/${studentId}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleDownloadReceipt = (b) => {
    const printWindow = window.open("", "_blank");
    const verificationId = b.bookingId || `CH-${b._id.slice(-6).toUpperCase()}`;
    const priceStr = b.eventPrice !== undefined ? `₹${b.eventPrice}` : "Paid/Free";
    const dateStr = b.eventDate || "TBA";
    const venueStr = b.eventVenue || "TBA";
    const collegeStr = b.collegeName || "N/A";
    const studentCollegeStr = b.studentCollegeName || "N/A";
    const emailStr = b.studentEmail || "N/A";
    const mobileStr = b.studentMobile || "N/A";
    const rollStr = b.studentRollNumber || "N/A";

    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation Receipt - ${b.eventName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              background: #f8fafc; 
              color: #1e293b; 
              padding: 40px 20px; 
              margin: 0; 
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .receipt-container { 
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 24px; 
              padding: 40px; 
              max-width: 500px; 
              width: 100%;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
              position: relative;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 2px dashed #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .logo-placeholder {
              font-family: 'Outfit', sans-serif;
              font-size: 1.5rem;
              font-weight: 800;
              background: linear-gradient(135deg, #06b6d4, #3b82f6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 8px;
            }
            .receipt-title {
              font-size: 1.1rem;
              font-weight: 600;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              color: #64748b;
              margin: 0;
            }
            .badge {
              display: inline-block;
              background: #dcfce7;
              color: #15803d;
              padding: 6px 16px;
              border-radius: 50px;
              font-size: 0.85rem;
              font-weight: 700;
              margin-top: 12px;
              text-transform: uppercase;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 10px;
            }
            .info-label {
              color: #64748b;
              font-size: 0.9rem;
            }
            .info-value {
              font-weight: 600;
              color: #0f172a;
              text-align: right;
            }
            .info-value.highlight {
              color: #3b82f6;
              font-weight: 700;
            }
            .footer-note {
              text-align: center;
              font-size: 0.75rem;
              color: #94a3b8;
              margin-top: 24px;
              line-height: 1.5;
            }
            .print-btn {
              display: block;
              width: 100%;
              background: #0f172a;
              color: #fff;
              border: none;
              padding: 14px;
              border-radius: 12px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              margin-top: 20px;
              transition: background 0.2s;
              text-align: center;
            }
            .print-btn:hover {
              background: #1e293b;
            }
            @media print {
              body { background: #fff; padding: 0; }
              .receipt-container { border: none; box-shadow: none; padding: 20px; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="logo-placeholder">CAMPUS HUB</div>
              <h2 class="receipt-title">Booking Confirmation</h2>
              <span class="badge">Confirmed Receipt</span>
            </div>
            
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Booking ID</span>
                <span class="info-value" style="font-family: monospace; font-size: 0.95rem; font-weight: bold;">${verificationId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Host College</span>
                <span class="info-value" style="color: #3b82f6;">${collegeStr}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Student College</span>
                <span class="info-value">${studentCollegeStr}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Student Name</span>
                <span class="info-value">${b.studentName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Roll Number</span>
                <span class="info-value">${rollStr}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mobile Number</span>
                <span class="info-value">${mobileStr}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email Address</span>
                <span class="info-value">${emailStr}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Event Name</span>
                <span class="info-value highlight">${b.eventName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Event Date</span>
                <span class="info-value">${dateStr}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Venue</span>
                <span class="info-value">${venueStr}</span>
              </div>
              <div class="info-row" style="border: none;">
                <span class="info-label" style="font-size: 1.05rem; font-weight: bold; color: #0f172a;">Amount Paid</span>
                <span class="info-value" style="font-size: 1.25rem; font-weight: 800; color: #15803d;">${priceStr}</span>
              </div>
            </div>
            
            <p class="footer-note">
              Thank you for booking with Campus Hub. Please show this receipt along with your university ID at the event venue entrance.
            </p>
            
            <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?\n\nDISCLAIMER: Ticket money will NOT be refunded under any circumstances!")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`);
        toast.success("Booking cancelled successfully.");
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          fetchBookings(currentUser._id);
        }
      } catch (err) {
        toast.error("Failed to cancel booking.");
        console.error(err);
      }
    }
  };

  const handleBookEvent = (event) => {
    localStorage.setItem("selectedEvent", JSON.stringify(event));
    navigate("/booking");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.name || user.email.split('@')[0]}</h1>
          <p>Student Portal - Manage your event bookings</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--primary)" }}>
            <FaTicketAlt />
          </div>
          <div className="stat-info">
            <h3>{bookings.filter(b => b.status !== "Completed" && b.status !== "Rejected").length}</h3>
            <p>Upcoming Events</p>
          </div>
        </motion.div>
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--secondary)" }}>
            <FaHistory />
          </div>
          <div className="stat-info">
            <h3>{bookings.filter(b => b.status === "Completed").length}</h3>
            <p>Past Events</p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel glass-panel">
          <h2>My Bookings</h2>
          {bookings.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--text-main)", outline: "none" }}
                >
                  <option value="dateDesc">Event Date (Newest First)</option>
                  <option value="dateAsc">Event Date (Oldest First)</option>
                  <option value="nameAsc">Event Name (A-Z)</option>
                  <option value="nameDesc">Event Name (Z-A)</option>
                  <option value="priceAsc">Price (Low to High)</option>
                  <option value="priceDesc">Price (High to Low)</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Filter Status</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)} 
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--text-main)", outline: "none" }}
                >
                  <option value="all">All Bookings</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}
          {getSortedBookings().length === 0 ? (
            <div className="empty-state">
              <FaRegCalendarTimes />
              <p>{bookings.length === 0 ? "You haven't booked any events yet." : "No bookings match the selected status filter."}</p>
              {bookings.length === 0 && (
                <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => navigate("/")}>
                  Browse Events
                </button>
              )}
            </div>
          ) : (
            <div>
              {getSortedBookings().map(b => (
                <div key={b._id} style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ color: "var(--primary)" }}>{b.eventName}</h3>
                    {b.bookingId && <p style={{ fontSize: "0.8rem", color: "var(--accent)", margin: "2px 0" }}>ID: {b.bookingId}</p>}
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Status: <span style={{ color: b.status === "Approved" ? "var(--success)" : b.status === "Rejected" ? "var(--danger)" : "orange", fontWeight: "bold" }}>{b.status}</span></p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {b.status === "Approved" && (
                      <button 
                        className="btn-secondary" 
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "0.85rem", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
                        onClick={() => handleDownloadReceipt(b)}
                      >
                        <FaDownload /> Receipt
                      </button>
                    )}
                    {(b.status === "Pending" || b.status === "Approved") && (
                      <button 
                        className="btn-primary" 
                        style={{ padding: "8px 14px", fontSize: "0.85rem", background: "var(--danger)", color: "#fff", width: "auto" }}
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dashboard-panel glass-panel">
          <h2>AI Recommendations</h2>
          {loadingRecommendations ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--accent)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 10px auto" }}></div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Matching your interests...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="empty-state">
              <p>No recommendations available right now. Check out the Home page to explore events!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recommendations.map(ev => (
                <div key={ev._id} style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                      <span style={{ background: "rgba(6,182,212,0.15)", color: "var(--accent)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase" }}>
                        {ev.category || "General"}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{ev.clubName}</span>
                    </div>
                  </div>
                  
                  <span style={{ color: "var(--primary)", fontSize: "0.75rem", fontWeight: "600", display: "inline-block" }}>
                    ✨ {ev.recommendationReason}
                  </span>
                  
                  <h3 style={{ fontSize: "1.05rem", color: "var(--text-main)", margin: "2px 0 0 0" }}>{ev.title}</h3>
                  {ev.collegeName && <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "var(--accent)" }}>🏫 {ev.collegeName}</p>}
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Date: {ev.date} | Venue: {ev.venue}</p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>₹{ev.price}</span>
                    <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "6px" }} onClick={() => handleBookEvent(ev)}>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;