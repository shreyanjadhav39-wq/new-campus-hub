import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarCheck, FaRobot, FaUsers, FaArrowRight, FaTicketAlt } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events`);
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  const handleBook = (event) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Please login as a student to book events.");
      localStorage.setItem("selectedEvent", JSON.stringify(event));
      navigate("/student-login");
      return;
    }
    if (currentUser.role !== "student") {
      alert("Only student accounts can book event tickets.");
      return;
    }
    localStorage.setItem("selectedEvent", JSON.stringify(event));
    navigate("/booking");
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Elevate Your <span className="text-gradient">Campus Life</span>
            </h1>
            <p className="hero-subtitle">
              The smartest way to manage clubs, book events, and connect with your university community. Experience the next generation of campus engagement.
            </p>
            
            <div className="hero-cta">
              <button className="btn-primary btn-large" onClick={() => navigate("/student-login")}>
                Get Started <FaArrowRight />
              </button>
              <button className="btn-secondary btn-large" onClick={() => navigate("/club-login")}>
                Register Club
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events Section (NEW) */}
      <section className="features-section">
        <div className="section-header">
          <h2>Upcoming <span className="text-gradient">Events</span></h2>
          <p>Discover and book the hottest events on campus right now.</p>
        </div>

        <div className="features-grid">
          {events.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)" }}>No events found. Check back later!</p>
          ) : (
            events.map((ev, i) => (
              <motion.div 
                key={ev._id}
                className="feature-card glass-panel"
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ textAlign: "left" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ background: "rgba(99,102,241,0.2)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
                    {ev.clubName}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{ev.date}</span>
                </div>
                <h3>{ev.title}</h3>
                <p style={{ marginBottom: "8px" }}><strong>Venue:</strong> {ev.venue}</p>
                <p style={{ marginBottom: "8px" }}><strong>Price:</strong> ₹{ev.price}</p>
                <p style={{ marginBottom: "20px" }}><strong>Seats Left:</strong> {ev.seatsLeft}/{ev.seats}</p>
                
                <button 
                  className="btn-primary" 
                  style={{ width: "100%" }}
                  onClick={() => handleBook(ev)}
                  disabled={ev.seatsLeft === 0}
                >
                  <FaTicketAlt /> {ev.seatsLeft === 0 ? "Sold Out" : "Book Now"}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="section-header">
          <h2>Why Choose <span className="text-gradient">Campus Hub?</span></h2>
          <p>Everything you need to make the most of your college experience.</p>
        </div>

        <div className="features-grid">
          <motion.div 
            className="feature-card glass-panel"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="feature-icon bg-primary-light">
              <FaCalendarCheck />
            </div>
            <h3>Seamless Booking</h3>
            <p>Discover and book tickets for college events instantly with secure digital verification and QR codes.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-panel"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-icon bg-secondary-light">
              <FaRobot />
            </div>
            <h3>AI Analytics</h3>
            <p>Predict event success rates and get smart recommendations based on student engagement data.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-panel"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="feature-icon bg-accent-light">
              <FaUsers />
            </div>
            <h3>Club Management</h3>
            <p>A dedicated dashboard for club leads to manage members, verify payments, and organize events effortlessly.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;