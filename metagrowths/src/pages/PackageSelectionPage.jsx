import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PackageSelectionPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const packages = [
    {
      id: "starter",
      name: "Starter Paket",
      originalPrice: "₺2,500",
      discountedPrice: "₺1,999",
      discount: "20%",
      duration: "1 Ay",
      features: [
        "Facebook & Instagram Reklam Yönetimi",
        "Günlük 500₺ Reklam Bütçesi",
        "Haftalık Raporlama",
        "2 Adet Kampanya",
        "Temel Analitik",
        "E-posta Desteği",
        "Reklam Kopyası Yazımı",
        "Hedef Kitle Analizi",
      ],
      popular: false,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "premium",
      name: "Premium Paket",
      originalPrice: "₺4,500",
      discountedPrice: "₺3,299",
      discount: "27%",
      duration: "1 Ay",
      features: [
        "Facebook & Instagram Reklam Yönetimi",
        "Günlük 1,500₺ Reklam Bütçesi",
        "Günlük Raporlama",
        "Sınırsız Kampanya",
        "Gelişmiş Analitik & A/B Testing",
        "7/24 Öncelikli Destek",
        "Özel Reklam Kopyası & Görsel Tasarım",
        "Hedef Kitle Optimizasyonu",
        "Reklam Performans Optimizasyonu",
        "Rakip Analizi",
        "ROAS Takibi",
        "Özel Strateji Danışmanlığı",
      ],
      popular: true,
      color: "from-orange-500 to-red-500",
    },
  ];

  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
    // Burada ödeme sayfasına yönlendirme yapılabilir
    console.log("Selected package:", packageId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      {/* Package Selection Section */}
      <section className="relative overflow-hidden py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div
              className={`transition-all duration-1000 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Reklam Paketlerimiz
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                İşinizin büyüklüğüne uygun paketi seçin ve dijital dünyada
                <span className="text-blue-600 font-semibold">
                  {" "}
                  büyümeye başlayın
                </span>
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`relative transition-all duration-1000 delay-${
                  (index + 1) * 200
                } ease-out transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Popüler
                    </span>
                  </div>
                )}

                <div
                  className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                    pkg.popular ? "ring-2 ring-orange-200" : ""
                  }`}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      {pkg.name}
                    </h3>
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                          {pkg.discountedPrice}
                        </span>
                        <span className="text-lg text-slate-500 line-through">
                          {pkg.originalPrice}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                          {pkg.discount} İndirim
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {pkg.duration} • Sınırlı Süre
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <svg
                            className="w-3 h-3 text-white"
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
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`group w-full bg-gradient-to-r ${pkg.color} text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden`}
                  >
                    <span className="relative z-10">
                      {pkg.popular ? "Popüler Paketi Seç" : "Paketi Seç"}
                    </span>
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        pkg.popular
                          ? "from-orange-400 to-red-400"
                          : "from-blue-400 to-slate-500"
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    ></div>
                  </button>

                  {pkg.popular && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-orange-600 font-medium">
                        🔥 En çok tercih edilen paket
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            className={`text-center mt-16 transition-all duration-1000 delay-600 ease-out transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                💡 Neden MetaGrowths Paketleri?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  %98 Müşteri Memnuniyeti
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  24/7 Teknik Destek
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Garantili Sonuç
                </div>
              </div>
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

export default PackageSelectionPage;
