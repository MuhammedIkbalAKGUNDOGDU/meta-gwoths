import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getApiUrl, getDefaultHeaders, API_ENDPOINTS } from "../config/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Giriş işlemi başarısız");
      }

      // Başarılı giriş
      if (data.status === "success") {
        // Token ve kullanıcı bilgilerini kaydet
        localStorage.setItem("metagrowths_token", data.data.token);
        localStorage.setItem(
          "metagrowths_user",
          JSON.stringify(data.data.user)
        );

        // Anket durumunu kontrol et
        try {
          const surveyResponse = await fetch(getApiUrl(API_ENDPOINTS.survey), {
            method: "GET",
            headers: getAuthHeaders(data.data.token),
          });

          if (surveyResponse.ok) {
            // Anket doldurulmuş, paket seçim sayfasına yönlendir
            alert("Başarıyla giriş yaptınız! Hoş geldiniz!");
            navigate("/reklam-paket-secim");
          } else {
            // Anket doldurulmamış, anket sayfasına yönlendir
            alert("Başarıyla giriş yaptınız! Hoş geldiniz!");
            navigate("/anket");
          }
        } catch (error) {
          // Hata durumunda anket sayfasına yönlendir
          alert("Başarıyla giriş yaptınız! Hoş geldiniz!");
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
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
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
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow"></div>
      </section>

      <Footer />
    </div>
  );
};

export default LoginPage;
