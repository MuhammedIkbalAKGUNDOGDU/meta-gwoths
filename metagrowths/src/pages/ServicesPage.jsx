import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ServicesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Refs for sections
  const mainServicesRef = useRef(null);
  const additionalServicesRef = useRef(null);
  const processRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
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
      mainServicesRef.current,
      additionalServicesRef.current,
      processRef.current,
    ];

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

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
                Hizmetlerimiz
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
                Dijital medya ajansı olarak sunduğumuz kapsamlı hizmetler ile
                <span className="text-blue-600 font-semibold">
                  {" "}
                  işinizi büyütün
                </span>
                ve
                <span className="text-slate-700 font-semibold">
                  {" "}
                  markanızı öne çıkarın
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow pointer-events-none"></div>
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
              className={`group bg-slate-50/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-blue-300/50 delay-100 ${
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
            </div>

            <div
              className={`group bg-slate-50/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 hover:border-blue-300/50 delay-200 ${
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
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section
        ref={processRef}
        id="process"
        className={`py-32 bg-gradient-to-br from-slate-100 to-blue-50 transition-all duration-1000 transform ${
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

      <Footer />
    </div>
  );
};

export default ServicesPage;
