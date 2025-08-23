import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getApiUrl, getDefaultHeaders, API_ENDPOINTS } from "../config/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
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
      // Şifre kontrolü
      if (formData.password !== formData.confirmPassword) {
        setError("Şifreler eşleşmiyor");
        setIsLoading(false);
        return;
      }

      // API'ye kayıt isteği gönder
      const response = await fetch(getApiUrl(API_ENDPOINTS.register), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          company: formData.company,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Şifre hatalarını özel olarak handle et
        if (data.message && data.message.includes("Şifre gereksinimleri")) {
          throw new Error(
            "Şifre gereksinimleri karşılanmıyor. Lütfen şifrenizin en az 6 karakter olduğundan, bir büyük harf, bir küçük harf ve bir rakam içerdiğinden emin olun."
          );
        }

        // Diğer validation hatalarını handle et
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        throw new Error(data.message || "Kayıt işlemi başarısız");
      }

      // Başarılı kayıt
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
          "✅ Kayıt başarılı! Kullanıcı bilgileri kaydedildi:",
          data.data.user
        );

        // Başarı mesajı göster ve anket sayfasına yönlendir
        alert("Hesabınız başarıyla oluşturuldu! Hoş geldiniz!");
        navigate("/anket");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Kayıt işlemi sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      {/* Register Section */}
      <section className="relative overflow-hidden py-32">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div
              className={`transition-all duration-1000 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Hesap Oluşturun
              </h1>
              <p className="text-slate-600">
                MetaGrowths ailesine katılın ve dijital dünyada büyümeye
                başlayın
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Ad
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-slate-700 mb-2"
                    >
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

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
                    htmlFor="company"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Şirket adınız (opsiyonel)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="+90 555 123 4567"
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
                  {/* Şifre gereksinimleri */}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Şifre gereksinimleri:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            formData.password.length >= 6
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></span>
                        En az 6 karakter
                      </li>
                      <li className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            /[a-z]/.test(formData.password)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></span>
                        En az bir küçük harf (a-z)
                      </li>
                      <li className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            /[A-Z]/.test(formData.password)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></span>
                        En az bir büyük harf (A-Z)
                      </li>
                      <li className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            /\d/.test(formData.password)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></span>
                        En az bir rakam (0-9)
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Şifre Tekrarı
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-300 focus:ring-red-500"
                        : formData.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ? "border-green-300 focus:ring-green-500"
                        : "border-slate-300"
                    }`}
                    placeholder="••••••••"
                  />
                  {/* Şifre eşleşme kontrolü */}
                  {formData.confirmPassword && (
                    <div className="mt-2 p-2 rounded-lg text-sm">
                      {formData.password === formData.confirmPassword ? (
                        <div className="flex items-center text-green-700">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Şifreler eşleşiyor
                        </div>
                      ) : (
                        <div className="flex items-center text-red-700">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Şifreler eşleşmiyor
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-slate-700"
                  >
                    <span>
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                      >
                        Kullanım şartlarını
                      </a>{" "}
                      ve{" "}
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                      >
                        gizlilik politikasını
                      </a>{" "}
                      kabul ediyorum
                    </span>
                  </label>
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
                      {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-slate-600">
                    Zaten hesabınız var mı?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                    >
                      Giriş yapın
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

export default RegisterPage;
