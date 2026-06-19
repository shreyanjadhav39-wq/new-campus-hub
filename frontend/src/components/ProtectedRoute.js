import { Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function ProtectedRoute({ children, allowedRoles }) {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser) {
    toast.error("Please login to access this page.");
    if (allowedRoles.includes("admin")) {
      return <Navigate to="/admin-login" replace />;
    } else if (allowedRoles.includes("club")) {
      return <Navigate to="/club-login" replace />;
    } else {
      return <Navigate to="/student-login" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    toast.error("Access denied. Insufficient permissions.");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
