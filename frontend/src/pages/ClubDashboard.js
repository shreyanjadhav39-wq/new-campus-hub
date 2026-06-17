import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPlusCircle, FaUsers, FaSignOutAlt, FaCalendarAlt, FaDownload } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/dashboard.css";

function ClubDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Event Form State
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [category, setCategory] = useState("General");
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "club") {
      navigate("/club-login");
    } else {
      setUser(currentUser);
      fetchEvents(currentUser.clubName);
      fetchBookings(currentUser.clubName);
    }
  }, [navigate]);

  useEffect(() => {
    if (!title && !price && !seats) {
      setPrediction(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingPrediction(true);
      try {
        const res = await axios.post(`${API_BASE_URL}/api/events/predict-success`, {
          title,
          venue,
          price: Number(price),
          seats: Number(seats),
          clubName: user?.clubName,
          category
        });
        setPrediction(res.data);
      } catch (err) {
        console.error("Failed to fetch success prediction", err);
      } finally {
        setLoadingPrediction(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [title, venue, price, seats, category, user?.clubName]);

  const fetchEvents = async (clubName) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events/club/${clubName}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async (clubName) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings/club/${clubName}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title, venue, date, 
        price: Number(price), 
        seats: Number(seats), 
        createdBy: user._id, 
        clubName: user.clubName,
        collegeName: user.collegeName || "",
        category
      };
      await axios.post(`${API_BASE_URL}/api/events`, payload);
      alert("Event created successfully!");
      setShowForm(false);
      setTitle("");
      setVenue("");
      setDate("");
      setPrice("");
      setSeats("");
      setCategory("General");
      setPrediction(null);
      fetchEvents(user.clubName);
    } catch (err) {
      alert("Failed to create event");
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, { status: newStatus });
      alert(`Booking ${newStatus} successfully!`);
      setSelectedBooking(null);
      fetchBookings(user.clubName);
      fetchEvents(user.clubName);
    } catch (err) {
      alert("Failed to update booking status");
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This will also delete all associated bookings!")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
        alert("Event deleted successfully!");
        fetchEvents(user.clubName);
        fetchBookings(user.clubName);
      } catch (err) {
        alert("Failed to delete event");
        console.error(err);
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`);
        alert("Booking deleted successfully!");
        setSelectedBooking(null);
        fetchBookings(user.clubName);
        fetchEvents(user.clubName);
      } catch (err) {
        alert("Failed to delete booking");
        console.error(err);
      }
    }
  };

  const handleExportToCSV = () => {
    const approvedBookings = bookings.filter(b => b.status === "Approved");
    if (approvedBookings.length === 0) {
      alert("No approved bookings to export.");
      return;
    }

    const headers = ["Booking ID", "Student Name", "Roll Number", "Mobile", "Email", "Event Name", "Event Date", "Venue", "Price (INR)", "Status"];
    const rows = approvedBookings.map(b => [
      b.bookingId || b._id,
      b.studentName,
      b.studentRollNumber || "N/A",
      b.studentMobile || "N/A",
      b.studentEmail || "N/A",
      b.eventName,
      b.eventDate || "TBA",
      b.eventVenue || "TBA",
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
    link.setAttribute("download", `approved_bookings_${user.clubName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  const approvedBookingsCount = bookings.filter(b => b.status === "Approved").length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>{user.clubName || user.name || "Club Portal"}</h1>
          {user.collegeName && <p style={{ fontSize: "1.2rem", color: "var(--primary)", marginTop: "4px", marginBottom: "8px" }}>🏫 {user.collegeName}</p>}
          <p>Manage your events, members, and bookings.</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--accent)" }}>
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>{events.length}</h3>
            <p>Active Events</p>
          </div>
        </motion.div>
        <motion.div className="stat-card glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-icon" style={{ color: "var(--secondary)" }}>
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{approvedBookingsCount}</h3>
            <p>Approved Attendees</p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel glass-panel" style={{ gridColumn: showForm ? "1 / -1" : "1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ margin: 0, border: "none", padding: 0 }}>My Events</h2>
            <button className="btn-primary" style={{ padding: "8px 16px" }} onClick={() => setShowForm(!showForm)}>
              <FaPlusCircle /> {showForm ? "Cancel" : "New Event"}
            </button>
          </div>
          
          {showForm && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "30px" }} className="event-creation-container">
              <form onSubmit={handleCreateEvent} className="auth-form" style={{ background: "rgba(0,0,0,0.2)", padding: "20px", borderRadius: "10px", margin: 0 }}>
                <div className="form-group"><label>Event Title</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} required /></div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} required style={{ width: "100%", padding: "14px 16px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-main)", outline: "none" }}>
                    <option value="General">General</option>
                    <option value="Tech">Tech</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                <div className="form-group"><label>Venue</label><input type="text" value={venue} onChange={e=>setVenue(e.target.value)} required /></div>
                <div className="form-group"><label>Date (e.g., Oct 24, 2026)</label><input type="text" value={date} onChange={e=>setDate(e.target.value)} required /></div>
                <div className="form-group"><label>Price (₹)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} required /></div>
                <div className="form-group"><label>Total Seats</label><input type="number" value={seats} onChange={e=>setSeats(e.target.value)} required /></div>
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>Create Event</button>
              </form>

              <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.08)", height: "fit-content" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)", marginBottom: "16px" }}>
                  <span>🤖</span> AI Success Predictor
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
                  Get real-time predictions on the booking success rate of your event as you design its parameters.
                </p>
                
                {loadingPrediction && (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--accent)", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 10px auto" }}></div>
                    <p style={{ color: "var(--text-muted)" }}>Analyzing event viability...</p>
                  </div>
                )}

                {!loadingPrediction && !prediction && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                    <p>Start filling out the title, price, or capacity to see AI predictions.</p>
                  </div>
                )}

                {!loadingPrediction && prediction && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Predicted Success Rate:</span>
                      <span style={{ fontSize: "1.6rem", fontWeight: "bold", color: prediction.successRate >= 80 ? "var(--success)" : prediction.successRate >= 50 ? "orange" : "var(--danger)" }}>
                        {prediction.successRate}%
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                      <div style={{ width: `${prediction.successRate}%`, height: "100%", background: prediction.successRate >= 80 ? "var(--success)" : prediction.successRate >= 50 ? "orange" : "var(--danger)", transition: "width 0.3s ease" }}></div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <strong>Estimated Demand: </strong> 
                      <span style={{ background: prediction.demandLevel === "High" ? "rgba(16, 185, 129, 0.2)" : prediction.demandLevel === "Moderate" ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)", color: prediction.demandLevel === "High" ? "var(--success)" : prediction.demandLevel === "Moderate" ? "orange" : "var(--danger)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>
                        {prediction.demandLevel} Demand
                      </span>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <h4 style={{ fontSize: "0.95rem", color: "var(--text)", marginBottom: "6px" }}>Core Factors:</h4>
                      <ul style={{ listStyleType: "none", paddingLeft: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                        {prediction.reasons.map((r, index) => (
                          <li key={index} style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <span style={{ color: "var(--primary)" }}>•</span> <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 style={{ fontSize: "0.95rem", color: "var(--accent)", marginBottom: "6px" }}>AI Action Items:</h4>
                      <ul style={{ listStyleType: "none", paddingLeft: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                        {prediction.suggestions.map((s, index) => (
                          <li key={index} style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <span style={{ color: "var(--accent)" }}>💡</span> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {events.length === 0 ? (
            <div className="empty-state">
              <FaCalendarAlt />
              <p>You haven't created any events yet.</p>
            </div>
          ) : (
            <div>
              {events.map(ev => (
                <div key={ev._id} style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ color: "var(--primary)", marginTop: 0, marginBottom: "6px" }}>{ev.title}</h3>
                    <p style={{ margin: "4px 0" }}>Date: {ev.date} | Venue: {ev.venue}</p>
                    <p style={{ margin: "4px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>Price: ₹{ev.price} | Seats Left: <strong>{ev.seatsLeft}/{ev.seats}</strong></p>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ background: "var(--danger)", color: "#fff", padding: "8px 12px", fontSize: "0.8rem", width: "auto" }}
                    onClick={() => handleDeleteEvent(ev._id)}
                  >
                    Delete Event
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!showForm && (
          <div className="dashboard-panel glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, border: "none", padding: 0 }}>Recent Bookings</h2>
              {bookings.filter(b => b.status === "Approved").length > 0 && (
                <button 
                  className="btn-primary" 
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "0.85rem", background: "var(--success)" }}
                  onClick={handleExportToCSV}
                >
                  <FaDownload /> Export CSV
                </button>
              )}
            </div>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings to display.</p>
              </div>
            ) : (
              <div className="bookings-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {bookings.map(b => (
                  <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "var(--text)" }}>{b.studentName}</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Event: <strong style={{ color: "var(--primary)" }}>{b.eventName}</strong>
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem" }}>
                        Status: <span style={{ color: b.status === "Approved" ? "var(--success)" : b.status === "Rejected" ? "var(--danger)" : "orange", fontWeight: "bold" }}>{b.status}</span>
                      </p>
                    </div>
                    <div>
                      {b.screenshot && (
                        <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setSelectedBooking(b)}>
                          {b.status === "Pending" ? "Verify Proof" : "View Proof"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proof Modal */}
      {selectedBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div className="glass-panel" style={{ maxWidth: "500px", width: "100%", padding: "24px", borderRadius: "16px", position: "relative", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--primary)" }}>Verify Payment Proof</h3>
            <p style={{ margin: "6px 0" }}><strong>Student:</strong> {selectedBooking.studentName}</p>
            {selectedBooking.studentRollNumber && <p style={{ margin: "6px 0" }}><strong>Roll Number:</strong> {selectedBooking.studentRollNumber}</p>}
            {selectedBooking.studentMobile && <p style={{ margin: "6px 0" }}><strong>Mobile:</strong> {selectedBooking.studentMobile}</p>}
            {selectedBooking.studentEmail && <p style={{ margin: "6px 0" }}><strong>Email:</strong> {selectedBooking.studentEmail}</p>}
            <p style={{ margin: "6px 0" }}><strong>Event:</strong> {selectedBooking.eventName}</p>
            <p style={{ margin: "6px 0" }}><strong>Status:</strong> <span style={{ color: selectedBooking.status === "Approved" ? "var(--success)" : selectedBooking.status === "Rejected" ? "var(--danger)" : "orange", fontWeight: "bold" }}>{selectedBooking.status}</span></p>
            <div style={{ background: "#000", borderRadius: "8px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", height: "250px", margin: "16px 0", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img src={selectedBooking.screenshot} alt="Payment Proof" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ background: "var(--danger)", color: "#fff", padding: "8px 16px" }} onClick={() => handleDeleteBooking(selectedBooking._id)}>Delete Booking</button>
              <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={() => setSelectedBooking(null)}>Close</button>
              {selectedBooking.status === "Pending" && (
                <>
                  <button className="btn-primary" style={{ background: "orange", color: "#fff", padding: "8px 16px" }} onClick={() => handleStatusUpdate(selectedBooking._id, "Rejected")}>Reject</button>
                  <button className="btn-primary" style={{ background: "var(--success)", color: "#fff", padding: "8px 16px" }} onClick={() => handleStatusUpdate(selectedBooking._id, "Approved")}>Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubDashboard;