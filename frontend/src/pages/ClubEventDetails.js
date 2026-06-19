import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheck, FaTimes, FaTrash, FaDownload, FaUserAlt, FaCreditCard, FaTicketAlt, FaSchool, FaCamera, FaQrcode } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config";
import { Html5QrcodeScanner } from "html5-qrcode";
import "../styles/dashboard.css";

function ClubEventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // QR Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "club") {
      navigate("/club-login");
      return;
    }
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    const onScanSuccess = async (decodedText) => {
      try {
        scanner.clear();
        setShowScanner(false);
        setScanResult({ loading: true });
        
        const res = await axios.post(`${API_BASE_URL}/api/bookings/check-in`, { bookingId: decodedText });
        toast.success(res.data.message || "Attendee Checked In Successfully!");
        setScanResult({ success: true, message: res.data.message, booking: res.data.booking });
        fetchDetails();
      } catch (err) {
        const errMsg = err.response?.data?.error || "Check-in failed. Invalid or already scanned ticket.";
        toast.error(errMsg);
        setScanResult({ success: false, error: errMsg });
      }
    };

    const onScanFailure = (err) => {
      // Silent ignore frames without QR codes
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner]);

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    try {
      setScanResult({ loading: true });
      const res = await axios.post(`${API_BASE_URL}/api/bookings/check-in`, { bookingId: manualCode });
      toast.success(res.data.message || "Attendee Checked In Successfully!");
      setScanResult({ success: true, message: res.data.message, booking: res.data.booking });
      setManualCode("");
      fetchDetails();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Check-in failed. Invalid or already scanned ticket.";
      toast.error(errMsg);
      setScanResult({ success: false, error: errMsg });
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Fetch Event details
      const eventsRes = await axios.get(`${API_BASE_URL}/api/events`);
      const currentEvent = eventsRes.data.find(e => e._id === id);
      if (!currentEvent) {
        toast.error("Event not found");
        navigate("/club-dashboard");
        return;
      }
      setEvent(currentEvent);

      // Fetch Event Bookings
      const bookingsRes = await axios.get(`${API_BASE_URL}/api/bookings/event/${id}`);
      setBookings(bookingsRes.data);
    } catch (err) {
      toast.error("Failed to load event details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProof = async (booking) => {
    setSelectedBooking({ ...booking, loadingScreenshot: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings/${booking._id}/screenshot`);
      setSelectedBooking({ ...booking, screenshot: res.data.screenshot, loadingScreenshot: false });
    } catch (err) {
      toast.error("Failed to load payment screenshot");
      setSelectedBooking(null);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus} successfully!`);
      setSelectedBooking(null);
      fetchDetails();
    } catch (err) {
      toast.error("Failed to update booking status");
      console.error(err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`);
        toast.success("Booking deleted successfully!");
        setSelectedBooking(null);
        fetchDetails();
      } catch (err) {
        toast.error("Failed to delete booking");
        console.error(err);
      }
    }
  };

  const handleExportCSV = () => {
    const approvedBookings = bookings.filter(b => b.status === "Approved");
    if (approvedBookings.length === 0) {
      toast.error("No approved bookings to export.");
      return;
    }

    const headers = ["Booking ID", "Student Name", "Student College", "Roll Number", "Mobile", "Email", "Event Name", "Price (INR)", "Status"];
    const rows = approvedBookings.map(b => [
      b.bookingId || b._id,
      b.studentName,
      b.studentCollegeName || "N/A",
      b.studentRollNumber || "N/A",
      b.studentMobile || "N/A",
      b.studentEmail || "N/A",
      b.eventName,
      b.eventPrice !== undefined ? b.eventPrice : "0",
      b.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_${event.title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported CSV successfully!");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--accent)", borderRadius: "50%", width: "50px", height: "50px", animation: "spin 1s linear infinite" }}></div>
      </div>
    );
  }

  if (!event) return null;

  // Stats Calculations
  const approvedCount = bookings.filter(b => b.status === "Approved").length;
  const pendingCount = bookings.filter(b => b.status === "Pending").length;
  const rejectedCount = bookings.filter(b => b.status === "Rejected").length;
  const checkedInCount = bookings.filter(b => b.checkedIn).length;
  const checkedInPercentage = Math.round((checkedInCount / approvedCount) * 100) || 0;

  const seatsReserved = event.seats - event.seatsLeft;
  const seatsPercentage = Math.round((seatsReserved / event.seats) * 100) || 0;
  const totalRevenue = approvedCount * (event.price || 0);

  const getFilteredBookings = () => {
    if (filterStatus === "all") return bookings;
    return bookings.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase());
  };

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "20px" }}>
        <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px", width: "auto", padding: "8px 16px" }} onClick={() => navigate("/club-dashboard")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="dashboard-header" style={{ marginBottom: "24px" }}>
        <div>
          <span style={{ background: "rgba(6,182,212,0.15)", color: "var(--accent)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", display: "inline-block", marginBottom: "8px" }}>
            {event.category || "General"}
          </span>
          <h1 className="text-gradient" style={{ fontSize: "2.2rem" }}>{event.title}</h1>
          <p style={{ fontSize: "1.1rem", marginTop: "4px" }}>
            📍 Venue: <strong>{event.venue}</strong> | 📅 Date: <strong>{event.date}</strong> | 🎫 Ticket: <strong>₹{event.price}</strong>
          </p>
          {event.collegeName && <p style={{ fontSize: "1rem", color: "var(--text-muted)", marginTop: "4px" }}>🏫 Host College: <strong>{event.collegeName}</strong></p>}
        </div>
      </div>

      {/* Event Stats Dashboard */}
      <div className="dashboard-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--primary)" }}>
            <FaTicketAlt />
          </div>
          <div className="stat-info">
            <h3>{seatsReserved} / {event.seats}</h3>
            <p>Seats Filled ({seatsPercentage}%)</p>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden", marginTop: "8px" }}>
              <div style={{ width: `${seatsPercentage}%`, height: "100%", background: "var(--primary)" }}></div>
            </div>
          </div>
        </motion.div>

        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--success)" }}>
            <FaCreditCard />
          </div>
          <div className="stat-info">
            <h3>₹{totalRevenue}</h3>
            <p>Total Revenue (Approved)</p>
          </div>
        </motion.div>

        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "orange" }}>
            <FaUserAlt />
          </div>
          <div className="stat-info">
            <h3>{pendingCount} Pending</h3>
            <p>{approvedCount} Approved | {rejectedCount} Rejected</p>
          </div>
        </motion.div>

        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--accent)" }}>
            <FaQrcode />
          </div>
          <div className="stat-info">
            <h3>{checkedInCount} / {approvedCount}</h3>
            <p>Checked In ({checkedInPercentage}%)</p>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden", marginTop: "8px" }}>
              <div style={{ width: `${checkedInPercentage}%`, height: "100%", background: "var(--accent)" }}></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Real-time Ticket Check-In Scanner Section */}
      <div className="dashboard-panel glass-panel" style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, border: "none", padding: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FaQrcode style={{ color: "var(--accent)" }} /> Gate Check-In Desk
          </h2>
          <button 
            className="btn-primary" 
            style={{ width: "auto", padding: "8px 16px", background: showScanner ? "var(--danger)" : "var(--accent)", color: showScanner ? "#fff" : "#000" }}
            onClick={() => {
              setShowScanner(!showScanner);
              setScanResult(null);
            }}
          >
            {showScanner ? "Close Camera" : "Open QR Scanner"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flexWrap: "wrap" }} className="event-creation-container">
          {/* Scanner view */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)", minHeight: "280px" }}>
            {showScanner ? (
              <div id="reader" style={{ width: "100%", maxWidth: "320px", borderRadius: "8px", overflow: "hidden" }}></div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                <FaCamera style={{ fontSize: "3.5rem", opacity: 0.2, margin: "0 auto 12px auto", display: "block" }} />
                <p>Click "Open QR Scanner" to use your device's camera for scanning student ticket QR codes.</p>
              </div>
            )}
          </div>

          {/* Manual Entry and Result Output */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(0,0,0,0.15)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <form onSubmit={handleManualCheckIn} className="auth-form" style={{ background: "transparent", border: "none", padding: 0, margin: 0 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Manual Ticket ID Check-In</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input 
                    type="text" 
                    placeholder="Enter Booking ID (e.g. EV1001 or Mongodb ID)" 
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    style={{ flex: 1, padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-main)", outline: "none" }}
                  />
                  <button type="submit" className="btn-primary" style={{ width: "auto", padding: "10px 20px" }}>Check In</button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {scanResult === null ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>Waiting for scans or manual entry...</p>
              ) : scanResult.loading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ border: "3px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--accent)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 10px auto" }}></div>
                  <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Processing check-in...</p>
                </div>
              ) : scanResult.success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--success)", borderRadius: "8px", padding: "16px", color: "var(--success)" }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>✅ Check-In Successful!</h4>
                  <p style={{ margin: "4px 0", color: "var(--text-main)" }}><strong>Attendee:</strong> {scanResult.booking.studentName}</p>
                  <p style={{ margin: "4px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}><strong>Ticket ID:</strong> {scanResult.booking.bookingId}</p>
                  <p style={{ margin: "4px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}><strong>Time:</strong> {new Date(scanResult.booking.checkInTime).toLocaleTimeString()}</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", padding: "16px", color: "var(--danger)" }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>❌ Check-In Failed</h4>
                  <p style={{ margin: 0, color: "var(--text-main)" }}>{scanResult.error}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List Panel */}
      <div className="dashboard-panel glass-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 style={{ margin: 0, border: "none", padding: 0 }}>Attendee Bookings ({getFilteredBookings().length})</h2>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--text-main)", outline: "none", cursor: "pointer" }}
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            {bookings.filter(b => b.status === "Approved").length > 0 && (
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", width: "auto", padding: "8px 14px", fontSize: "0.85rem", background: "var(--success)" }} onClick={handleExportCSV}>
                <FaDownload /> Export CSV
              </button>
            )}
          </div>
        </div>

        {getFilteredBookings().length === 0 ? (
          <div className="empty-state">
            <p>No bookings matching filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  <th style={{ padding: "12px 8px" }}>Attendee Name</th>
                  <th style={{ padding: "12px 8px" }}>College Details</th>
                  <th style={{ padding: "12px 8px" }}>Roll / Contact</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                  <th style={{ padding: "12px 8px" }}>Attendance</th>
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
                      <div>Roll: {b.studentRollNumber || "N/A"}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{b.studentMobile} | {b.studentEmail}</div>
                    </td>
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
                    <td style={{ padding: "12px 8px" }}>
                      {b.status === "Approved" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ 
                            color: b.checkedIn ? "var(--success)" : "var(--text-muted)",
                            fontSize: "0.85rem",
                            fontWeight: "bold"
                          }}>
                            {b.checkedIn ? "Checked In" : "Not Checked In"}
                          </span>
                          {b.checkedIn && b.checkInTime && (
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {new Date(b.checkInTime).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                        {b.status === "Approved" && (
                          <button 
                            className="btn-primary" 
                            style={{ 
                              padding: "6px 10px", 
                              fontSize: "0.75rem", 
                              width: "auto", 
                              background: b.checkedIn ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                              color: b.checkedIn ? "var(--danger)" : "var(--success)",
                              border: `1px solid ${b.checkedIn ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
                            }} 
                            onClick={async () => {
                              try {
                                await axios.patch(`${API_BASE_URL}/api/bookings/${b._id}/check-in`, { checkedIn: !b.checkedIn });
                                toast.success(b.checkedIn ? "Check-in reverted." : "Checked in successfully!");
                                fetchDetails();
                              } catch (err) {
                                toast.error(err.response?.data?.error || "Failed to update check-in status");
                              }
                            }}
                          >
                            {b.checkedIn ? "Undo In" : "Check In"}
                          </button>
                        )}
                        <button className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.75rem", width: "auto" }} onClick={() => handleVerifyProof(b)}>
                          Verify Proof
                        </button>
                        <button 
                          onClick={() => handleDeleteBooking(b._id)}
                          style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px" }}
                          title="Delete Booking"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof Modal */}
      {selectedBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div className="glass-panel" style={{ maxWidth: "500px", width: "100%", padding: "24px", borderRadius: "16px", position: "relative", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--primary)" }}>Verify Payment Proof</h3>
            <p style={{ margin: "6px 0" }}><strong>Student:</strong> {selectedBooking.studentName}</p>
            <p style={{ margin: "6px 0" }}><strong>College:</strong> {selectedBooking.studentCollegeName || "N/A"}</p>
            <p style={{ margin: "6px 0" }}><strong>Roll Number:</strong> {selectedBooking.studentRollNumber || "N/A"}</p>
            <p style={{ margin: "6px 0" }}><strong>Contact:</strong> {selectedBooking.studentMobile} | {selectedBooking.studentEmail}</p>
            <p style={{ margin: "6px 0" }}><strong>Status:</strong> <span style={{ color: selectedBooking.status === "Approved" ? "var(--success)" : selectedBooking.status === "Rejected" ? "var(--danger)" : "orange", fontWeight: "bold" }}>{selectedBooking.status}</span></p>
            
            <div style={{ background: "#000", borderRadius: "8px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", height: "250px", margin: "16px 0", border: "1px solid rgba(255,255,255,0.1)" }}>
              {selectedBooking.loadingScreenshot ? (
                <div style={{ border: "3px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--accent)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite" }}></div>
              ) : (
                <img src={selectedBooking.screenshot} alt="Payment Proof" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              )}
            </div>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ background: "var(--danger)", color: "#fff", padding: "8px 16px" }} onClick={() => handleDeleteBooking(selectedBooking._id)}>Delete Booking</button>
              <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={() => setSelectedBooking(null)}>Close</button>
              {selectedBooking.status === "Pending" && (
                <>
                  <button className="btn-primary" style={{ background: "orange", color: "#fff", padding: "8px 16px" }} onClick={() => handleStatusUpdate(selectedBooking._id, "Rejected")}><FaTimes /> Reject</button>
                  <button className="btn-primary" style={{ background: "var(--success)", color: "#fff", padding: "8px 16px" }} onClick={() => handleStatusUpdate(selectedBooking._id, "Approved")}><FaCheck /> Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubEventDetails;
