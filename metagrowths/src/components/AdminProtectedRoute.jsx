import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated } from "../utils/adminAuth";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/adminlogin");
    }
  }, [navigate]);

  return isAdminAuthenticated() ? children : null;
};

export default AdminProtectedRoute;
