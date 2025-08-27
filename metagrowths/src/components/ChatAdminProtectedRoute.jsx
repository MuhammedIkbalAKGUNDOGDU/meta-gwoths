import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isChatAdminAuthenticated } from "../utils/chatAdminAuth";

const ChatAdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isChatAdminAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        navigate("/chat-admin-login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ChatAdminProtectedRoute;
