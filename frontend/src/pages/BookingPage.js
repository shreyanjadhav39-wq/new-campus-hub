import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyCheckAlt, FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
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
  const [studentCollegeName, setStudentCollegeName] = useState("");

  useEffect(() => {
    const selected = JSON.parse(sessionStorage.getItem("selectedEvent"));
    if (!selected) {
      toast.error("No event selected. Please choose an event from the home page.");
      navigate("/");
    } else {
      setEvent(selected);
    }

    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (currentUser) {
      setEmail(currentUser.email || "");
      setMobile(currentUser.mobileNumber || "");
      setRollNumber(currentUser.rollNumber || "");
      setStudentCollegeName(currentUser.collegeName || "");
    }
  }, [navigate]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!email || !mobile || !rollNumber || !studentCollegeName) {
      toast.error("Please fill in all student information fields.");
      return;
    }
    if (!image) {
      toast.error("Please upload payment screenshot.");
      return;
    }
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) {
      toast.error("Please login first");
      return;
    }

    try {
      const payload = {
        studentId: currentUser._id,
        studentName: currentUser.name,
        studentEmail: email,
        studentMobile: mobile,
        studentRollNumber: rollNumber,
        studentCollegeName: studentCollegeName,
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
      toast.success("Booking Submitted Successfully 🚀");
      navigate("/student-dashboard");
    } catch (err) {
      toast.error("Failed to submit booking");
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
          
          {event.paymentType === "link" ? (
            <button 
              className="btn-primary" 
              onClick={() => window.open(event.paymentLink, "_blank")}
              style={{ width: "100%", padding: "16px", marginTop: "10px" }}
            >
              <FaMoneyCheckAlt /> Pay via Custom Link
            </button>
          ) : event.paymentType === "qr" ? (
            <div style={{ marginTop: "15px", textAlign: "center", background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ marginBottom: "10px", fontSize: "0.95rem", fontWeight: "bold", color: "var(--accent)" }}>Scan QR Code to Pay</p>
              {event.paymentQR ? (
                <img src={event.paymentQR} alt="Payment QR" style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", margin: "0 auto" }} />
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No QR Code image uploaded by club.</p>
              )}
            </div>
          ) : (
            <button 
              className="btn-primary" 
              onClick={() => window.open("https://vierp.in", "_blank")}
              style={{ width: "100%", padding: "16px", marginTop: "10px" }}
            >
              <FaMoneyCheckAlt /> Pay via VIERP
            </button>
          )}
        </div>

        <div className="dashboard-panel glass-panel">
          <h2>Student Information</h2>
          <div className="auth-form" style={{ background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
            <div className="form-group">
              <label>College Name</label>
              <input type="text" value={studentCollegeName} onChange={e => setStudentCollegeName(e.target.value)} required placeholder="e.g. State Tech College" />
            </div>
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