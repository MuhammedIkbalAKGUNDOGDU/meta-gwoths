import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { isAdminAuthenticated, getAdminInfo } from "../utils/adminAuth";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsVisible(true);

    // Otomatik admin giriş kontrolü
    checkAutoAdminLogin();
  }, [navigate]);

  // Otomatik admin giriş fonksiyonu
  const checkAutoAdminLogin = () => {
    try {
      // localStorage'da admin token var mı kontrol et
      if (isAdminAuthenticated()) {
        const adminInfo = getAdminInfo();

        if (adminInfo) {
          console.log("🔄 Admin otomatik giriş yapılıyor...", adminInfo);

          // Role'a göre yönlendirme
          let redirectPath = "/admin";
          if (adminInfo.role === "forms_admin") {
            redirectPath = "/admin/forms";
          } else if (adminInfo.role === "super_admin") {
            redirectPath = "/admin/super";
          }

          console.log("✅ Admin otomatik giriş başarılı!", adminInfo);
          navigate(redirectPath);
        }
      }
    } catch (error) {
      console.error("Admin otomatik giriş hatası:", error);
      // Hata durumunda localStorage'ı temizle
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Hata mesajını temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Admin bilgilerini kontrol et
      const adminCredentials = {
        admin: {
          password: "123",
          token: "admin_token_123",
          role: "survey_admin",
        },
        forms_admin: {
          password: "456",
          token: "forms_admin_token_456",
          role: "forms_admin",
        },
        super_admin: {
          password: "789",
          token: "super_admin_token_789",
          role: "super_admin",
        },
      };

      const admin = adminCredentials[formData.username];

      if (admin && formData.password === admin.password) {
        // Admin token'ı oluştur ve kaydet
        localStorage.setItem("admin_token", admin.token);
        localStorage.setItem(
          "admin_user",
          JSON.stringify({
            username: formData.username,
            role: admin.role,
          })
        );

        // Role'a göre yönlendirme
        let redirectPath = "/admin";
        if (admin.role === "forms_admin") {
          redirectPath = "/admin/forms";
        } else if (admin.role === "super_admin") {
          redirectPath = "/admin/super";
        }

        alert("Admin girişi başarılı! Admin paneline yönlendiriliyorsunuz.");
        navigate(redirectPath);
      } else {
        setError("Kullanıcı adı veya şifre hatalı!");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Giriş sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md transition-all duration-1000 ease-out transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent mb-2">
            Admin Girişi
          </h1>
          <p className="text-slate-600">
            Admin paneline erişim için giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Şifrenizi girin"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Giriş Yapılıyor...
                </div>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-slate-600 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              ← Ana Sayfaya Dön
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Admin Bilgileri
            </h3>
            <p className="text-xs text-blue-600">
              <strong>Survey Admin:</strong> admin / 123
              <br />
              <strong>Forms Admin:</strong> forms_admin / 456
              <br />
              <strong>Super Admin:</strong> super_admin / 789
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
