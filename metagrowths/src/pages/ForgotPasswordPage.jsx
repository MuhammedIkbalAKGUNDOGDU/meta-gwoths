import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ForgotPasswordPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Password reset logic here
    console.log("Password reset request for:", email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      {/* Forgot Password Section */}
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
                Şifremi Unuttum
              </h1>
              <p className="text-slate-600">
                E-posta adresinizi girin, şifre sıfırlama bağlantısını
                gönderelim
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
              {!isSubmitted ? (
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="group w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 px-4 rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden"
                    >
                      <span className="relative z-10">
                        Şifre Sıfırlama Bağlantısı Gönder
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-600">
                      <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
                      >
                        Giriş sayfasına dön
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                    E-posta Gönderildi!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine
                    gönderildi. Lütfen e-posta kutunuzu kontrol edin.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Not:</strong> E-posta gelmezse spam klasörünüzü
                      kontrol edin.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-block bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 px-6 rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition-all duration-500"
                  >
                    Giriş Sayfasına Dön
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow pointer-events-none"></div>
      </section>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
