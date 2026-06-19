import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarCheck, FaRobot, FaUsers, FaArrowRight, FaTicketAlt, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const uniqueColleges = Array.from(
    new Set(events.map(ev => ev.collegeName).filter(Boolean))
  );

  const getFilteredEvents = () => {
    return events.filter(ev => {
      const matchesSearch = ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ev.clubName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollege = selectedCollege === "all" || ev.collegeName === selectedCollege;
      const matchesCategory = selectedCategory === "all" || ev.category === selectedCategory;
      return matchesSearch && matchesCollege && matchesCategory;
    });
  };

  const handleBook = (event) => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) {
      toast.error("Please login as a student to book events.");
      sessionStorage.setItem("selectedEvent", JSON.stringify(event));
      navigate("/student-login");
      return;
    }
    if (currentUser.role !== "student") {
      toast.error("Only student accounts can book event tickets.");
      return;
    }
    sessionStorage.setItem("selectedEvent", JSON.stringify(event));
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

        {/* Search & Filters */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "30px", maxWidth: "900px", margin: "0 auto 30px auto" }} className="search-filter-container">
          <div style={{ position: "relative", flex: 2, minWidth: "250px" }}>
            <FaSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by event title or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "12px 16px 12px 40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-main)", outline: "none" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-main)", outline: "none", cursor: "pointer" }}
            >
              <option value="all">All Colleges</option>
              {uniqueColleges.map((col, index) => (
                <option key={index} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-main)", outline: "none", cursor: "pointer" }}
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Tech">Tech</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
        </div>

        <div className="features-grid">
          {getFilteredEvents().length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)" }}>No events matching your filters. Check back later!</p>
          ) : (
            getFilteredEvents().map((ev, i) => (
              <motion.div 
                key={ev._id}
                className="feature-card glass-panel"
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ textAlign: "left", padding: "16px", display: "flex", flexDirection: "column" }}
              >
                {ev.bannerImage ? (
                  <img src={ev.bannerImage} alt={ev.title} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
                ) : (
                  <div style={{ width: "100%", height: "140px", background: "linear-gradient(135deg, #1e1b4b, #311042)", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <FaCalendarCheck style={{ fontSize: "2.5rem", color: "var(--primary)", opacity: 0.6 }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ background: "rgba(99,102,241,0.2)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
                    {ev.clubName}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {ev.date} {ev.startTime && `| 🕒 ${ev.startTime}`}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px 0" }}>{ev.title}</h3>
                {ev.collegeName && <p style={{ marginBottom: "8px", color: "var(--accent)", fontSize: "0.9rem" }}>🏫 {ev.collegeName}</p>}
                
                {ev.description && (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", height: "36px", lineHeight: "1.5" }}>
                    {ev.description}
                  </p>
                )}
                
                <div style={{ marginTop: "auto" }}>
                  <p style={{ marginBottom: "6px", fontSize: "0.9rem" }}><strong>Venue:</strong> {ev.venue}</p>
                  <p style={{ marginBottom: "6px", fontSize: "0.9rem" }}><strong>Price:</strong> ₹{ev.price}</p>
                  <p style={{ marginBottom: "16px", fontSize: "0.9rem" }}><strong>Seats Left:</strong> {ev.seatsLeft}/{ev.seats}</p>
                  
                  <button 
                    className="btn-primary" 
                    style={{ width: "100%" }}
                    onClick={() => handleBook(ev)}
                    disabled={ev.seatsLeft === 0}
                  >
                    <FaTicketAlt /> {ev.seatsLeft === 0 ? "Sold Out" : "Book Now"}
                  </button>
                </div>
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