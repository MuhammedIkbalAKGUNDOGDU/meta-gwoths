import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PackageSelectionPage from "./pages/PackageSelectionPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import SurveyPage from "./pages/SurveyPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import FormsAdminPage from "./pages/FormsAdminPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reklam-paket-secim" element={<PackageSelectionPage />} />
      <Route path="/hizmetler" element={<ServicesPage />} />
      <Route path="/hakkimizda" element={<AboutPage />} />
      <Route path="/iletisim" element={<ContactPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:userId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/anket"
        element={
          <ProtectedRoute>
            <SurveyPage />
          </ProtectedRoute>
        }
      />
      <Route path="/adminlogin" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminPanelPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/forms"
        element={
          <AdminProtectedRoute>
            <FormsAdminPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/super"
        element={
          <AdminProtectedRoute>
            <SuperAdminPage />
          </AdminProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
