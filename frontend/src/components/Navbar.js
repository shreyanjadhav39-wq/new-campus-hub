import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaGraduationCap, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "../styles/navbar.css";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    setUser(currentUser);
  }, [location]);

  const handleLogout = () => {
    // Notify server of logout
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (currentUser && currentUser._id) {
      axios.post(`${API_BASE_URL}/api/auth/logout-status`, { userId: currentUser._id }).catch(err => console.error(err));
    }
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "student") return "/student-dashboard";
    if (user.role === "club") return "/club-dashboard";
    if (user.role === "admin") return "/admin-dashboard";
    return "/";
  };

  return (
    <nav className={`navbar-global ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaGraduationCap className="logo-icon" />
          <span className="text-gradient">Campus Hub</span>
        </Link>

        <div className="menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {user && (
            <Link to={getDashboardPath()} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          <div className="auth-buttons">
            {user ? (
              <button className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <button className="btn-secondary" onClick={() => { navigate("/student-login"); setMobileMenuOpen(false); }}>
                  Student Login
                </button>
                <button className="btn-primary" onClick={() => { navigate("/club-login"); setMobileMenuOpen(false); }}>
                  Club Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
