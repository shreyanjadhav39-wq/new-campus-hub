import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyCheckAlt, FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/dashboard.css"; // Reuse dashboard container styles

function BookingPage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [event, setEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  useEffect(() => {
    const selected = JSON.parse(localStorage.getItem("selectedEvent"));
    if (!selected) {
      alert("No event selected. Please choose an event from the home page.");
      navigate("/");
    } else {
      setEvent(selected);
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      setEmail(currentUser.email || "");
      setMobile(currentUser.mobileNumber || "");
      setRollNumber(currentUser.rollNumber || "");
    }
  }, [navigate]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!email || !mobile || !rollNumber) {
      alert("Please fill in all student information fields.");
      return;
    }
    if (!image) {
      alert("Please upload payment screenshot.");
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    try {
      const payload = {
        studentId: currentUser._id,
        studentName: currentUser.name,
        studentEmail: email,
        studentMobile: mobile,
        studentRollNumber: rollNumber,
        collegeName: event.collegeName || "",
        eventId: event._id,
        eventName: event.title || event.name,
        clubId: event.clubName,
        eventDate: event.date,
        eventVenue: event.venue,
        eventPrice: event.price,
        screenshot: image
      };

      await axios.post(`${API_BASE_URL}/api/bookings`, payload);
      alert("Booking Submitted Successfully 🚀");
      navigate("/student-dashboard");
    } catch (err) {
      alert("Failed to submit booking");
      console.error(err);
    }
  };

  if (!event) return <h1>Loading...</h1>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="text-gradient">Complete Your Booking</h1>
          <p>Secure your spot for the upcoming event.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel glass-panel">
          <h2>Event Details</h2>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.8rem", color: "var(--primary)", marginBottom: "10px" }}>{event.title || event.name}</h3>
            {event.collegeName && <p style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--accent)" }}><strong>College:</strong> {event.collegeName}</p>}
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}><strong>Venue:</strong> {event.venue}</p>
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}><strong>Date:</strong> {event.date}</p>
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}><strong>Price:</strong> ₹{event.price}</p>
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}><strong>Seats Left:</strong> {event.seatsLeft !== undefined ? event.seatsLeft : event.seats}</p>
          </div>
          
          <button 
            className="btn-primary" 
            onClick={() => window.open("https://vierp.in", "_blank")}
            style={{ width: "100%", padding: "16px", marginTop: "10px" }}
          >
            <FaMoneyCheckAlt /> Pay via VIERP
          </button>
        </div>

        <div className="dashboard-panel glass-panel">
          <h2>Student Information</h2>
          <div className="auth-form" style={{ background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@university.edu" />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="e.g. 9876543210" />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} required placeholder="e.g. CS2026101" />
            </div>
          </div>

          <h2>Payment Verification</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            Please upload a screenshot of your successful transaction to secure your booking.
          </p>

          <div style={{ background: "rgba(0,0,0,0.2)", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "12px", padding: "30px", textAlign: "center", position: "relative", marginBottom: "20px" }}>
            <input 
              type="file" 
              onChange={handleImage} 
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
            />
            {!image ? (
              <div>
                <FaCloudUploadAlt style={{ fontSize: "3rem", color: "var(--primary)", marginBottom: "10px" }} />
                <p>Click or drag image to upload</p>
              </div>
            ) : (
              <img src={image} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px" }} />
            )}
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            style={{ width: "100%", padding: "16px", background: "var(--success)" }}
          >
            Submit Proof & Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;