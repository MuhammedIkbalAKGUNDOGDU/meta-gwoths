import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Refs for sections
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);
  const statsRef = useRef(null);

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
      storyRef.current,
      valuesRef.current,
      teamRef.current,
      statsRef.current,
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
                Hakkımızda
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
                Dijital medya ajansı olarak
                <span className="text-blue-600 font-semibold">
                  {" "}
                  güvenilir çözümler
                </span>
                sunuyor ve
                <span className="text-slate-700 font-semibold">
                  {" "}
                  markaları büyütüyoruz
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow"></div>
      </section>

      {/* Our Story Section */}
      <section
        ref={storyRef}
        id="story"
        className={`py-32 bg-white transition-all duration-1000 transform ${
          visibleSections.has("story")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("story")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Hikayemiz
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                2020 yılında kurulan MetaGrowths, dijital pazarlama alanında
                uzmanlaşmış bir ekiple yola çıktı. Amacımız, işletmelerin
                dijital dünyada başarılı olmasını sağlamak ve onların büyüme
                hedeflerine ulaşmasına yardımcı olmaktı.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Bugün, 500+ başarılı kampanya ve %98 müşteri memnuniyeti ile
                Türkiye'nin önde gelen dijital medya ajanslarından biri haline
                geldik. Her projede yenilikçi yaklaşımlar ve sonuç odaklı
                stratejiler kullanıyoruz.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Müşterilerimizin başarısı bizim başarımızdır. Bu yüzden her
                adımda şeffaf, güvenilir ve kaliteli hizmet sunmaya devam
                ediyoruz.
              </p>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("story")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Misyonumuz</h3>
                <p className="text-blue-100 leading-relaxed">
                  İşletmelerin dijital dönüşümünü hızlandırmak ve sürdürülebilir
                  büyüme sağlamak için yenilikçi dijital çözümler sunmak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={valuesRef}
        id="values"
        className={`py-32 bg-gradient-to-br from-slate-100 to-blue-50 transition-all duration-1000 transform ${
          visibleSections.has("values")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("values")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Değerlerimiz
              </h2>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("values")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Çalışma prensiplerimizi oluşturan temel değerlerimiz
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`text-center group transition-all duration-700 delay-100 transform ${
                visibleSections.has("values")
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
                Güvenilirlik
              </h3>
              <p className="text-slate-600">
                Şeffaf süreçler ve güvenilir çözümler sunuyoruz
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-200 transform ${
                visibleSections.has("values")
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
                Yenilikçilik
              </h3>
              <p className="text-slate-600">
                En son teknolojileri kullanarak yenilikçi çözümler
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-300 transform ${
                visibleSections.has("values")
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
                Müşteri Odaklılık
              </h3>
              <p className="text-slate-600">
                Müşteri memnuniyeti odaklı yaklaşım
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        ref={teamRef}
        id="team"
        className={`py-32 bg-white transition-all duration-1000 transform ${
          visibleSections.has("team")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("team")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Ekibimiz
              </h2>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 transform ${
                visibleSections.has("team")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Deneyimli ve uzman ekibimizle projelerinizi başarıyla
                tamamlıyoruz
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`text-center group transition-all duration-700 delay-100 transform ${
                visibleSections.has("team")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Dijital Pazarlama Uzmanları
              </h3>
              <p className="text-slate-600">
                Meta reklamları ve sosyal medya yönetimi konusunda uzman
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-200 transform ${
                visibleSections.has("team")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-16 h-16 text-white"
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
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Web Geliştiriciler
              </h3>
              <p className="text-slate-600">
                Modern teknolojilerle web çözümleri geliştiriyor
              </p>
            </div>

            <div
              className={`text-center group transition-all duration-700 delay-300 transform ${
                visibleSections.has("team")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-16 h-16 text-white"
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
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                İçerik Yaratıcıları
              </h3>
              <p className="text-slate-600">
                Yaratıcı içerikler ve görsel tasarımlar üretiyor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        id="stats"
        className={`py-32 bg-gradient-to-r from-blue-600 to-slate-700 transition-all duration-1000 transform ${
          visibleSections.has("stats")
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                visibleSections.has("stats")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Başarılarımız
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div
              className={`group transition-all duration-700 delay-100 transform ${
                visibleSections.has("stats")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-500">
                500+
              </div>
              <div className="text-blue-100">Başarılı Kampanya</div>
            </div>
            <div
              className={`group transition-all duration-700 delay-200 transform ${
                visibleSections.has("stats")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-500">
                98%
              </div>
              <div className="text-blue-100">Müşteri Memnuniyeti</div>
            </div>
            <div
              className={`group transition-all duration-700 delay-300 transform ${
                visibleSections.has("stats")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-500">
                24/7
              </div>
              <div className="text-blue-100">Reklam Yönetimi</div>
            </div>
            <div
              className={`group transition-all duration-700 delay-400 transform ${
                visibleSections.has("stats")
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-500">
                5+
              </div>
              <div className="text-blue-100">Yıl Deneyim</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
