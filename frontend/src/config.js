export const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : (process.env.REACT_APP_API_URL || "https://new-campus-hub.onrender.com");

