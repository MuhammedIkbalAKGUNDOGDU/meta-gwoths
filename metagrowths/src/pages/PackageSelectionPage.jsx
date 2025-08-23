import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getApiUrl } from "../config/api";

const PackageSelectionPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsVisible(true);
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    // Giriş yapan kişinin bilgilerini localStorage'dan al
    const userInfo = localStorage.getItem("user_info");
    const token = localStorage.getItem("metagrowths_token");
    let currentUser = null;

    if (userInfo) {
      try {
        currentUser = JSON.parse(userInfo);
      } catch (error) {
        console.error("Kullanıcı bilgileri parse edilemedi:", error);
      }
    }

    // Eğer kullanıcı bilgisi yoksa simüle edilmiş kullanıcı kullan
    if (!currentUser) {
      currentUser = {
        customer_id: 123,
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
      };
      console.warn(
        "⚠️ Kullanıcı bilgileri bulunamadı, simüle edilmiş kullanıcı kullanılıyor"
      );
    }

    console.log("Abonelik durumu kontrol ediliyor...");
    console.log("👤 Giriş Yapan Kullanıcı:", currentUser);

    // Gerçek API isteği yap
    if (token) {
      try {
        const response = await fetch("/api/auth/subscription", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const hasSubscription = true;

          console.log("💳 Abonelik Durumu Sonucu (API):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            hasSubscription: hasSubscription,
            message: "Aktif abonelik var",
          });

          alert(
            "Zaten aktif bir aboneliğiniz var! Dashboard'a yönlendiriliyorsunuz."
          );
          navigate("/dashboard");
          return;
        } else if (response.status === 404) {
          console.log("💳 Abonelik Durumu Sonucu (API 404):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            hasSubscription: false,
            message: "Abonelik bulunamadı (henüz seçilmemiş)",
          });
        }
      } catch (error) {
        console.error("API isteği hatası:", error);
        console.log("💳 Abonelik Durumu Sonucu (Hata):", {
          user: `${currentUser.first_name} ${currentUser.last_name}`,
          customer_id: currentUser.customer_id,
          email: currentUser.email,
          hasSubscription: false,
          message: "API hatası - abonelik yok varsayılıyor",
        });
      }
    } else {
      console.log("💳 Abonelik Durumu Sonucu (Token Yok):", {
        user: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_id: currentUser.customer_id,
        email: currentUser.email,
        hasSubscription: false,
        message: "Token bulunamadı - abonelik yok varsayılıyor",
      });
    }
  };

  const packages = [
    {
      id: "starter",
      name: "Starter Paket",
      price: 299,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Temel e-ticaret sitesi",
        "100 ürün limiti",
        "Email desteği",
        "Temel analitik",
        "Mobil uyumlu tasarım",
      ],
      store_setup: {
        included: true,
        duration: "2-3 gün",
        features: [
          "Temel mağaza kurulumu",
          "Ürün kategorileri",
          "Ödeme sistemi entegrasyonu",
          "Kargo entegrasyonu",
        ],
      },
      popular: false,
      color: "from-blue-500 to-blue-600",
      total_amount: 299,
    },
    {
      id: "growth",
      name: "Growth Paket",
      price: 599,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Gelişmiş e-ticaret özellikleri",
        "500 ürün limiti",
        "Öncelikli destek",
        "Gelişmiş analitik",
        "SEO optimizasyonu",
        "Sosyal medya entegrasyonu",
      ],
      store_setup: {
        included: true,
        duration: "3-5 gün",
        features: [
          "Özelleştirilmiş mağaza tasarımı",
          "Gelişmiş ürün yönetimi",
          "Çoklu ödeme seçenekleri",
          "Stok takip sistemi",
          "Müşteri yorumları sistemi",
        ],
      },
      popular: true,
      color: "from-green-500 to-green-600",
      total_amount: 599,
    },
    {
      id: "professional",
      name: "Professional Paket",
      price: 999,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Çoklu mağaza yönetimi",
        "API erişimi",
        "2000 ürün limiti",
        "Özel entegrasyonlar",
        "Gelişmiş raporlama",
        "Çoklu dil desteği",
      ],
      store_setup: {
        included: true,
        duration: "5-7 gün",
        features: [
          "Özel mağaza tasarımı",
          "Gelişmiş kategori yapısı",
          "Çoklu satıcı sistemi",
          "Gelişmiş filtreleme",
          "Özel raporlama paneli",
          "API entegrasyonları",
        ],
      },
      popular: false,
      color: "from-purple-500 to-purple-600",
      total_amount: 999,
    },
    {
      id: "enterprise",
      name: "Enterprise Paket",
      price: 1999,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Sınırsız özellikler",
        "Özel çözümler",
        "7/24 öncelikli destek",
        "Özel eğitim",
        "Dedicated sunucu",
        "Özel güvenlik",
      ],
      store_setup: {
        included: true,
        duration: "7-10 gün",
        features: [
          "Tam özelleştirilmiş mağaza",
          "Özel entegrasyonlar",
          "Gelişmiş güvenlik",
          "Yüksek performans",
          "Özel domain",
          "SSL sertifikası",
          "CDN entegrasyonu",
        ],
      },
      popular: false,
      color: "from-orange-500 to-red-500",
      total_amount: 1999,
    },
    {
      id: "ecommerce_basic",
      name: "E-commerce Basic",
      price: 399,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Temel e-ticaret",
        "300 ürün limiti",
        "Temel ödeme sistemleri",
        "Mobil uyumluluk",
      ],
      store_setup: {
        included: true,
        duration: "2-4 gün",
        features: [
          "E-ticaret mağaza kurulumu",
          "Ürün yönetimi",
          "Sipariş takibi",
          "Müşteri hesap sistemi",
        ],
      },
      popular: false,
      color: "from-indigo-500 to-indigo-600",
      total_amount: 399,
    },
    {
      id: "ecommerce_pro",
      name: "E-commerce Pro",
      price: 799,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Gelişmiş e-ticaret",
        "1000 ürün limiti",
        "Çoklu ödeme seçenekleri",
        "Gelişmiş stok yönetimi",
      ],
      store_setup: {
        included: true,
        duration: "4-6 gün",
        features: [
          "Gelişmiş e-ticaret kurulumu",
          "Çoklu ödeme entegrasyonu",
          "Gelişmiş stok sistemi",
          "Kargo entegrasyonu",
          "Müşteri sadakat sistemi",
        ],
      },
      popular: false,
      color: "from-teal-500 to-teal-600",
      total_amount: 799,
    },
    {
      id: "marketplace_basic",
      name: "Marketplace Basic",
      price: 499,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Temel pazaryeri",
        "500 ürün limiti",
        "Çoklu satıcı sistemi",
        "Temel komisyon sistemi",
      ],
      store_setup: {
        included: true,
        duration: "3-5 gün",
        features: [
          "Pazaryeri kurulumu",
          "Satıcı kayıt sistemi",
          "Temel komisyon yönetimi",
          "Ürün onay sistemi",
        ],
      },
      popular: false,
      color: "from-pink-500 to-pink-600",
      total_amount: 499,
    },
    {
      id: "marketplace_pro",
      name: "Marketplace Pro",
      price: 899,
      currency: "TRY",
      duration: "1 Ay",
      features: [
        "Gelişmiş pazaryeri",
        "2000 ürün limiti",
        "Gelişmiş satıcı yönetimi",
        "Çoklu komisyon oranları",
      ],
      store_setup: {
        included: true,
        duration: "5-8 gün",
        features: [
          "Gelişmiş pazaryeri kurulumu",
          "Satıcı paneli",
          "Gelişmiş komisyon sistemi",
          "Satıcı değerlendirme sistemi",
          "Çoklu kategori yönetimi",
          "Gelişmiş raporlama",
        ],
      },
      popular: false,
      color: "from-yellow-500 to-orange-500",
      total_amount: 899,
    },
  ];

  const handlePackageSelect = async (packageId) => {
    setSelectedPackage(packageId);
    setError("");
    setIsLoading(true);

    try {
      const selectedPkg = packages.find((pkg) => pkg.id === packageId);
      if (!selectedPkg) {
        setError("Paket bulunamadı");
        return;
      }

      const token = localStorage.getItem("metagrowths_token");

      if (!token) {
        throw new Error("Token bulunamadı. Lütfen tekrar giriş yapın.");
      }

      console.log("Seçilen paket gönderiliyor:", selectedPkg);

      const response = await fetch("/api/auth/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_name: selectedPkg.name,
          package_details: selectedPkg,
          total_amount: selectedPkg.total_amount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Paket başarıyla seçildi:", data);

        alert(
          `"${selectedPkg.name}" paketi başarıyla seçildi! Dashboard'a yönlendiriliyorsunuz.`
        );
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Paket seçilirken bir hata oluştu"
        );
      }
    } catch (error) {
      console.error("Package selection error:", error);
      setError(error.message || "Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
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
                Abonelik Paketlerimiz
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                İşinizin büyüklüğüne uygun paketi seçin ve
                <span className="text-blue-600 font-semibold">
                  {" "}
                  mağaza kurulumu ile birlikte
                </span>{" "}
                dijital dünyada büyümeye başlayın
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                          ₺{pkg.price}
                        </span>
                        <span className="text-lg text-slate-500">
                          /{pkg.duration}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">
                        Toplam: ₺{pkg.total_amount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Paket Özellikleri:
                    </h4>
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <svg
                            className="w-2.5 h-2.5 text-white"
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
                        <span className="text-slate-700 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {pkg.store_setup.included && (
                    <div className="space-y-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          Mağaza Kurulumu Dahil ({pkg.store_setup.duration})
                        </h4>
                        <div className="space-y-2">
                          {pkg.store_setup.features.map(
                            (setupFeature, setupIndex) => (
                              <div
                                key={setupIndex}
                                className="flex items-start"
                              >
                                <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                  <svg
                                    className="w-1.5 h-1.5 text-white"
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
                                <span className="text-blue-700 text-xs">
                                  {setupFeature}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handlePackageSelect(pkg.id)}
                    disabled={isLoading}
                    className={`group w-full bg-gradient-to-r ${
                      pkg.color
                    } text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          İşleniyor...
                        </div>
                      ) : pkg.popular ? (
                        "Popüler Paketi Seç"
                      ) : (
                        "Paketi Seç"
                      )}
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
                💡 Neden MetaGrowths Abonelik Paketleri?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Mağaza Kurulumu Dahil
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  7/24 Teknik Destek
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Garantili Başarı
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
