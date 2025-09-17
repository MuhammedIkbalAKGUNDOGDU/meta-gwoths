import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getApiUrl } from "../config/api";
import {
  isChatAdminAuthenticated,
  getChatAdminUser,
} from "../utils/chatAdminAuth";

const ChatAdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Otomatik giriş kontrolü
    checkAutoLogin();
  }, []);

  // Otomatik giriş fonksiyonu
  const checkAutoLogin = async () => {
    try {
      // localStorage'da chat admin token var mı kontrol et
      if (isChatAdminAuthenticated()) {
        const userInfo = getChatAdminUser();

        if (userInfo) {
          console.log("🔄 Chat Admin otomatik giriş yapılıyor...", userInfo);

          // Token'ın geçerliliğini kontrol et
          const response = await fetch(getApiUrl("/auth/chat-admin-profile"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("chatAdminToken")}`,
            },
          });

          if (response.ok) {
            const data = await response.json();

            if (data.status === "success") {
              console.log("✅ Chat Admin otomatik giriş başarılı!", data.data);

              // Normal kullanıcı formatında da kaydet (tutarlılık için)
              localStorage.setItem(
                "metagrowths_token",
                localStorage.getItem("chatAdminToken")
              );
              localStorage.setItem(
                "metagrowths_user",
                localStorage.getItem("chatAdminUser")
              );

              // Chat admin sayfasına yönlendir
              navigate("/chat-admin");
            } else {
              // Token geçersiz, localStorage'ı temizle
              localStorage.clear();
              sessionStorage.clear();
            }
          } else {
            // Token geçersiz, localStorage'ı temizle
            localStorage.clear();
            sessionStorage.clear();
          }
        }
      }
    } catch (error) {
      console.error("Chat Admin otomatik giriş hatası:", error);
      // Hata durumunda localStorage'ı temizle
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("/auth/chat-admin-login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Token'ı localStorage'a kaydet (hem chat admin hem normal format)
        localStorage.setItem("chatAdminToken", data.token);
        localStorage.setItem("chatAdminUser", JSON.stringify(data.user));

        // Normal kullanıcı formatında da kaydet (tutarlılık için)
        localStorage.setItem("metagrowths_token", data.token);
        localStorage.setItem("metagrowths_user", JSON.stringify(data.user));

        console.log("✅ Chat Admin girişi başarılı:", {
          token: data.token ? `${data.token.substring(0, 20)}...` : "null",
          user: data.user,
          localStorage_chatAdminToken: localStorage.getItem("chatAdminToken")
            ? "kaydedildi"
            : "kaydedilmedi",
          localStorage_chatAdminUser: localStorage.getItem("chatAdminUser")
            ? "kaydedildi"
            : "kaydedilmedi",
          localStorage_metagrowths_token: localStorage.getItem(
            "metagrowths_token"
          )
            ? "kaydedildi"
            : "kaydedilmedi",
          localStorage_metagrowths_user: localStorage.getItem(
            "metagrowths_user"
          )
            ? "kaydedildi"
            : "kaydedilmedi",
        });

        // Chat admin sayfasına yönlendir
        navigate("/chat-admin");
      } else {
        setError(data.message || "Giriş başarısız");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Bağlantı hatası oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Chat Yönetimi
              </h1>
              <p className="text-slate-600">
                Reklamcı, Editör veya Admin hesabınızla giriş yapın
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Sadece Reklamcı, Editör ve Admin rolleri giriş yapabilir
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-green-600 text-xs font-bold">R</span>
                  </div>
                  <span className="text-xs text-slate-600">Reklamcı</span>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-blue-600 text-xs font-bold">E</span>
                  </div>
                  <span className="text-xs text-slate-600">Editör</span>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-red-600 text-xs font-bold">A</span>
                  </div>
                  <span className="text-xs text-slate-600">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatAdminLoginPage;
