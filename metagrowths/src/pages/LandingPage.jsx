import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactModal from "../components/ContactModal";
import {
  getApiUrl,
  getDefaultHeaders,
  getAuthHeaders,
  API_ENDPOINTS,
} from "../config/api";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebFormOpen, setIsWebFormOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isWebFormClosing, setIsWebFormClosing] = useState(false);
  const [isMobileFormClosing, setIsMobileFormClosing] = useState(false);
  const [webFormData, setWebFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
  });
  const [mobileFormData, setMobileFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
  });

  // Refs for sections
  const trustSectionRef = useRef(null);
  const mainServicesRef = useRef(null);
  const additionalServicesRef = useRef(null);
  const featuresRef = useRef(null);
  const processRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for sections
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]));
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = [
      trustSectionRef.current,
      mainServicesRef.current,
      additionalServicesRef.current,
      featuresRef.current,
      processRef.current,
      ctaRef.current,
    ];

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleWebFormOpen = () => {
    setIsWebFormOpen(true);
  };

  const handleWebFormClose = () => {
    setIsWebFormClosing(true);
    setTimeout(() => {
      setIsWebFormOpen(false);
      setIsWebFormClosing(false);
    }, 300);
  };

  const handleMobileFormOpen = () => {
    setIsMobileFormOpen(true);
  };

  const handleMobileFormClose = () => {
    setIsMobileFormClosing(true);
    setTimeout(() => {
      setIsMobileFormOpen(false);
      setIsMobileFormClosing(false);
    }, 300);
  };

  const handleWebFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Token varsa kullan, yoksa normal gönder
      const token = localStorage.getItem("metagrowths_token");
      const headers = token ? getAuthHeaders(token) : getDefaultHeaders();

      const response = await fetch(getApiUrl(API_ENDPOINTS.webForm), {
        method: "POST",
        headers,
        body: JSON.stringify(webFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Validation hatalarını göster
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join("\n");
          alert(`Form hataları:\n${errorMessages}`);
        } else {
          throw new Error(data.message || "Form gönderimi başarısız");
        }
        return;
      }

      alert(
        "Web geliştirme formunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız."
      );

      setWebFormData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        projectDescription: "",
        budget: "",
      });
      setIsWebFormOpen(false);
    } catch (error) {
      console.error("Web form submission error:", error);
      alert("Form gönderimi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleMobileFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Token varsa kullan, yoksa normal gönder
      const token = localStorage.getItem("metagrowths_token");
      const headers = token ? getAuthHeaders(token) : getDefaultHeaders();

      const response = await fetch(getApiUrl(API_ENDPOINTS.mobileForm), {
        method: "POST",
        headers,
        body: JSON.stringify(mobileFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Validation hatalarını göster
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join("\n");
          alert(`Form hataları:\n${errorMessages}`);
        } else {
          throw new Error(data.message || "Form gönderimi başarısız");
        }
        return;
      }

      alert(
        "Mobil uygulama formunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız."
      );

      setMobileFormData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        projectDescription: "",
        budget: "",
      });
      setIsMobileFormOpen(false);
    } catch (error) {
      console.error("Mobile form submission error:", error);
      alert("Form gönderimi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div
              className={`transition-all duration-1500 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 tracking-tight">
                Dijital Medya
                <span className="block bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                  Ajansınız
                </span>
              </h1>
            </div>

            <div
              className={`transition-all duration-1500 delay-300 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Meta reklamları, içerik yönetimi ve e-ticaret çözümleriyle
                <span className="text-blue-600 font-semibold">
                  {" "}
                  satışlarınızı artırın
                </span>{" "}
                ve
                <span className="text-slate-700 font-semibold">
                  {" "}
                  markanızı büyütün
                </span>
                .
              </p>
            </div>

            <div
              className={`transition-all duration-1500 delay-500 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={handleOpenModal}
                  className="group bg-gradient-to-r from-blue-600 to-slate-700 text-white px-12 py-4 rounded-xl font-medium hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden"
                >
                  <span className="relative z-10">Ücretsiz Danışmanlık</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
                <button className="border-2 border-slate-300 text-slate-700 px-12 py-4 rounded-xl font-medium hover:border-blue-500 hover:text-blue-600 transition-all duration-500 backdrop-blur-sm hover:bg-white/50">
                  Projelerimizi İnceleyin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow"></div>
      </section>

      {/* Trust Indicators */}
      <section
        ref={trustSectionRef}
        id="trust-section"
        className={`py-20 bg-white/50 backdrop-blur-sm transition-all duration-1000 transform ${
          visibleSections.has("trust-section")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-500">
                500+
              </div>
              <div className="text-slate-600">Başarılı Kampanya</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-500">
                98%
              </div>
              <div className="text-slate-600">Müşteri Memnuniyeti</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-500">
                24/7
              </div>
              <div className="text-slate-600">Reklam Yönetimi</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-500">
                5+
              </div>
              <div className="text-slate-600">Yıl Deneyim</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section
        ref={mainServicesRef}
        id="main-services"
        className={`py-32 bg-gradient-to-br from-slate-100 to-blue-50 transition-all duration-1000 transform ${
          visibleSections.has("main-services")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("main-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Ana Hizmetlerimiz
              </h2>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("main-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Dijital medya ajansı olarak ana odak noktamız reklam yönetimi ve
                içerik üretimi
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Meta Yönetimi */}
            <div
              className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-orange-300/50 delay-100 ${
                visibleSections.has("main-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                Meta Yönetimi
              </h3>
              <p className="text-orange-600 font-semibold text-sm mb-4">
                SATIŞ ARTIRMA
              </p>
              <p className="text-slate-600 leading-relaxed">
                Facebook ve Instagram reklamları ile hedef kitlenizi bulun,
                satışlarınızı katlayın.
              </p>
            </div>

            {/* İçerik Yönetimi */}
            <div
              className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-purple-300/50 delay-200 ${
                visibleSections.has("main-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                İçerik Yönetimi
              </h3>
              <p className="text-purple-600 font-semibold text-sm mb-4">
                MARKALAŞMA
              </p>
              <p className="text-slate-600 leading-relaxed">
                Sosyal medya içerikleri ile markanızı dijitalde öne çıkarın,
                hedef kitlenizle etkileşim kurun.
              </p>
            </div>

            {/* E-Ticaret Yönetimi */}
            <div
              className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-green-300/50 delay-300 ${
                visibleSections.has("main-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                E-Ticaret Yönetimi
              </h3>
              <p className="text-green-600 font-semibold text-sm mb-4">
                ALTYAPI VE OTOMASYON
              </p>
              <p className="text-slate-600 leading-relaxed">
                E-ticaret mağazanızı kurun, satış süreçlerinizi otomatikleştirin
                ve büyütün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section
        ref={additionalServicesRef}
        id="additional-services"
        className={`py-32 bg-white transition-all duration-1000 transform ${
          visibleSections.has("additional-services")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("additional-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Yan Hizmetlerimiz
              </h2>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("additional-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Dijital varlığınızı destekleyen ek hizmetlerimiz
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              onClick={handleWebFormOpen}
              className={`group bg-slate-50/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-blue-300/50 delay-100 cursor-pointer ${
                visibleSections.has("additional-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                Web Geliştirme
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Modern ve responsive web siteleri geliştiriyoruz. SEO uyumlu,
                hızlı ve güvenli çözümler.
              </p>
              <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                Teklif Al →
              </div>
            </div>

            <div
              onClick={handleMobileFormOpen}
              className={`group bg-slate-50/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-blue-300/50 delay-200 cursor-pointer ${
                visibleSections.has("additional-services")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
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
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                Mobil Uygulama
              </h3>
              <p className="text-slate-600 leading-relaxed">
                iOS ve Android için native mobil uygulamalar. Kullanıcı dostu
                arayüzler ve performanslı kodlama.
              </p>
              <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                Teklif Al →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className={`py-32 bg-gradient-to-br from-slate-100 to-blue-50 transition-all duration-1000 transform ${
          visibleSections.has("features")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("features")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Neden{" "}
                <span className="bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                  MetaGrowths
                </span>
                ?
              </h2>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("features")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Güvenilir, şeffaf ve sonuç odaklı yaklaşımımızla fark
                yaratıyoruz
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              className={`text-center group transition-all duration-700 delay-100 transform ${
                visibleSections.has("features")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Güvenilir
              </h3>
              <p className="text-slate-600">
                Şeffaf süreçler ve güvenilir çözümler
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-200 transform ${
                visibleSections.has("features")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Hızlı
              </h3>
              <p className="text-slate-600">
                Zamanında teslimat ve hızlı çözümler
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-300 transform ${
                visibleSections.has("features")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Uzman
              </h3>
              <p className="text-slate-600">Deneyimli ve uzman ekip</p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-400 transform ${
                visibleSections.has("features")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Kaliteli
              </h3>
              <p className="text-slate-600">
                Yüksek kaliteli ve sürdürülebilir çözümler
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section
        ref={processRef}
        id="process"
        className={`py-32 bg-white transition-all duration-1000 transform ${
          visibleSections.has("process")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("process")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Çalışma Sürecimiz
              </h2>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("process")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Şeffaf ve sistematik yaklaşımımızla projelerinizi başarıyla
                tamamlıyoruz
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div
              className={`text-center group transition-all duration-700 delay-100 transform ${
                visibleSections.has("process")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Analiz
              </h3>
              <p className="text-slate-600">
                İhtiyaçlarınızı detaylı analiz ediyoruz
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-200 transform ${
                visibleSections.has("process")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Tasarım
              </h3>
              <p className="text-slate-600">
                Modern ve kullanıcı dostu tasarımlar
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-300 transform ${
                visibleSections.has("process")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Geliştirme
              </h3>
              <p className="text-slate-600">En son teknolojilerle geliştirme</p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-400 transform ${
                visibleSections.has("process")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Teslimat
              </h3>
              <p className="text-slate-600">Zamanında ve kaliteli teslimat</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        id="cta"
        className={`py-32 bg-gradient-to-r from-blue-600 to-slate-700 transition-all duration-1000 transform ${
          visibleSections.has("cta")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`transition-all duration-1000 delay-200 transform ${
              visibleSections.has("cta")
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Projenizi{" "}
              <span className="bg-gradient-to-r from-blue-200 to-slate-200 bg-clip-text text-transparent">
                Başlatalım
              </span>
            </h2>
          </div>
          <div
            className={`transition-all duration-1000 delay-400 transform ${
              visibleSections.has("cta")
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              MetaGrowths ile işinizi dijital dünyada güvenle büyütmek için
              hemen başlayın.
            </p>
          </div>
          <div
            className={`transition-all duration-1000 delay-600 transform ${
              visibleSections.has("cta")
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <button
              onClick={handleOpenModal}
              className="group bg-white text-blue-600 px-12 py-5 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden text-lg"
            >
              <span className="relative z-10">Ücretsiz Danışmanlık</span>
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Web Development Form Modal */}
      {isWebFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isWebFormClosing ? "animate-slideOut" : "animate-slideIn"
            }`}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">
                  Web Geliştirme Teklifi
                </h2>
                <button
                  onClick={handleWebFormClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleWebFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      value={webFormData.name}
                      onChange={(e) =>
                        setWebFormData({ ...webFormData, name: e.target.value })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={webFormData.surname}
                      onChange={(e) =>
                        setWebFormData({
                          ...webFormData,
                          surname: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      required
                      value={webFormData.email}
                      onChange={(e) =>
                        setWebFormData({
                          ...webFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={webFormData.phone}
                      onChange={(e) =>
                        setWebFormData({
                          ...webFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0555 123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Proje Açıklaması *
                  </label>
                  <textarea
                    required
                    value={webFormData.projectDescription}
                    onChange={(e) =>
                      setWebFormData({
                        ...webFormData,
                        projectDescription: e.target.value,
                      })
                    }
                    rows="4"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Web siteniz hakkında detayları paylaşın (e-ticaret, kurumsal site, blog vb.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tahmini Bütçe *
                  </label>
                  <select
                    required
                    value={webFormData.budget}
                    onChange={(e) =>
                      setWebFormData({ ...webFormData, budget: e.target.value })
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Bütçe seçiniz...</option>
                    <option value="5k-15k">5.000 TL - 15.000 TL</option>
                    <option value="15k-30k">15.000 TL - 30.000 TL</option>
                    <option value="30k-50k">30.000 TL - 50.000 TL</option>
                    <option value="50k-100k">50.000 TL - 100.000 TL</option>
                    <option value="100k+">100.000 TL+</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleWebFormClose}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Teklif Gönder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Form Modal */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isMobileFormClosing ? "animate-slideOut" : "animate-slideIn"
            }`}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">
                  Mobil Uygulama Teklifi
                </h2>
                <button
                  onClick={handleMobileFormClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleMobileFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileFormData.name}
                      onChange={(e) =>
                        setMobileFormData({
                          ...mobileFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileFormData.surname}
                      onChange={(e) =>
                        setMobileFormData({
                          ...mobileFormData,
                          surname: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      required
                      value={mobileFormData.email}
                      onChange={(e) =>
                        setMobileFormData({
                          ...mobileFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileFormData.phone}
                      onChange={(e) =>
                        setMobileFormData({
                          ...mobileFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0555 123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Proje Açıklaması *
                  </label>
                  <textarea
                    required
                    value={mobileFormData.projectDescription}
                    onChange={(e) =>
                      setMobileFormData({
                        ...mobileFormData,
                        projectDescription: e.target.value,
                      })
                    }
                    rows="4"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Mobil uygulamanız hakkında detayları paylaşın (iOS, Android, hibrit vb.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tahmini Bütçe *
                  </label>
                  <select
                    required
                    value={mobileFormData.budget}
                    onChange={(e) =>
                      setMobileFormData({
                        ...mobileFormData,
                        budget: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Bütçe seçiniz...</option>
                    <option value="15k-30k">15.000 TL - 30.000 TL</option>
                    <option value="30k-50k">30.000 TL - 50.000 TL</option>
                    <option value="50k-100k">50.000 TL - 100.000 TL</option>
                    <option value="100k-200k">100.000 TL - 200.000 TL</option>
                    <option value="200k+">200.000 TL+</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleMobileFormClose}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Teklif Gönder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
