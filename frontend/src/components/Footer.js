import { Link } from "react-router-dom";
import { FaTwitter, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer-global">
      <div className="footer-content">
        <div className="footer-section brand">
          <h2 className="text-gradient">Campus Hub</h2>
          <p>The ultimate platform for smart event booking and club management. Bringing students and clubs together.</p>
        </div>
        
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/student-login">Student Portal</Link></li>
            <li><Link to="/club-login">Club Portal</Link></li>
            <li><Link to="/admin-login">Admin Portal</Link></li>
          </ul>
        </div>
        
        <div className="footer-section social">
          <h3>Connect</h3>
          <div className="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="mailto:contact@campushub.com" aria-label="Email"><FaEnvelope /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Campus Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
