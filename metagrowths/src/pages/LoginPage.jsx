import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InfoModal from "../components/InfoModal";
import { getApiUrl, getDefaultHeaders, API_ENDPOINTS } from "../config/api";
import { isAuthenticated, getUserInfo } from "../utils/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "",
    message: "",
    type: "info",
    redirectPath: "",
  });

  useEffect(() => {
    setIsVisible(true);

    // Otomatik giriş kontrolü
    checkAutoLogin();
  }, []);

  // Otomatik giriş fonksiyonu
  const checkAutoLogin = async () => {
    try {
      // localStorage'da token var mı kontrol et
      if (isAuthenticated()) {
        const userInfo = getUserInfo();

        if (userInfo) {
          console.log("🔄 Otomatik giriş yapılıyor...", userInfo);

          // Token'ın geçerliliğini kontrol et (opsiyonel)
          const response = await fetch(getApiUrl(API_ENDPOINTS.profile), {
            method: "GET",
            headers: {
              ...getDefaultHeaders(),
              Authorization: `Bearer ${localStorage.getItem(
                "metagrowths_token"
              )}`,
            },
          });

          if (response.ok) {
            const data = await response.json();

            if (data.status === "success") {
              console.log("✅ Otomatik giriş başarılı!", data.data);

              // Anket durumuna göre yönlendirme
              const surveyCompleted = data.data.survey_completed;

              if (surveyCompleted) {
                // Anket tamamlanmış, paket seçim sayfasına yönlendir
                navigate("/reklam-paket-secim");
              } else {
                // Anket tamamlanmamış, anket sayfasına yönlendir
                navigate("/anket");
              }
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
      console.error("Otomatik giriş hatası:", error);
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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleModalClose = () => {
    setShowInfoModal(false);
  };

  const handleModalContinue = () => {
    setShowInfoModal(false);
    navigate(modalInfo.redirectPath);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // API'ye giriş isteği gönder
      const response = await fetch(getApiUrl(API_ENDPOINTS.login), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = "Giriş işlemi başarısız";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Sunucu hatası: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Başarılı giriş
      if (data.status === "success") {
        // Token ve kullanıcı bilgilerini kaydet
        localStorage.setItem("metagrowths_token", data.data.token);
        localStorage.setItem(
          "metagrowths_user",
          JSON.stringify(data.data.user)
        );

        // Kullanıcı bilgilerini user_info olarak da kaydet (diğer sayfalar için)
        localStorage.setItem("user_info", JSON.stringify(data.data.user));

        console.log(
          "✅ Giriş başarılı! Kullanıcı bilgileri kaydedildi:",
          data.data.user
        );

        // Backend'den gelen survey_completed bilgisini kullan
        const surveyCompleted = data.data.survey_completed;

        console.log("📊 Anket Durumu:", {
          user: `${data.data.user.first_name} ${data.data.user.last_name}`,
          customer_id: data.data.user.customer_id,
          survey_completed: surveyCompleted,
          message: surveyCompleted
            ? "Anket tamamlanmış"
            : "Anket tamamlanmamış",
        });

        // Anket durumuna göre yönlendirme yap
        if (surveyCompleted) {
          // Anket doldurulmuş, modal göster ve paket seçim sayfasına yönlendir
          setModalInfo({
            title: "Hoş Geldiniz! 🎉",
            message:
              "Anketiniz zaten tamamlanmış. Şimdi size uygun reklam paketini seçebilirsiniz.",
            type: "success",
            redirectPath: "/reklam-paket-secim",
          });
          setShowInfoModal(true);
        } else {
          // Anket doldurulmamış, direkt anket sayfasına yönlendir
          navigate("/anket");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Giriş işlemi sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      {/* Login Section */}
      <section className="relative overflow-hidden py-32">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div
              className={`transition-all duration-1000 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Hoş Geldiniz
              </h1>
              <p className="text-slate-600">
                Hesabınıza giriş yapın ve dijital dünyada büyümeye devam edin
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ease-out transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/50">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
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
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
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

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-500 relative overflow-hidden ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-2xl transform hover:scale-105"
                    }`}
                  >
                    <span className="relative z-10">
                      {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-slate-600">
                    Hesabınız yok mu?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                    >
                      Kayıt olun
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow pointer-events-none"></div>
      </section>

      <Footer />

      {/* Info Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={handleModalClose}
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
        buttonText="Devam Et"
        onButtonClick={handleModalContinue}
      />
    </div>
  );
};

export default LoginPage;
