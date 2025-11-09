import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdditionalServicesModal from "../components/AdditionalServicesModal";
import { getApiUrl } from "../config/api";

const PackageSelectionPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
        const response = await fetch(getApiUrl("/auth/subscription"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const hasSubscription = data.data && data.data.subscription;

          console.log("💳 Abonelik Durumu Sonucu (API):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            hasSubscription: hasSubscription,
            message: hasSubscription
              ? "Aktif abonelik var"
              : "Aktif abonelik yok",
          });

          if (hasSubscription) {
            setShowSubscriptionModal(true);
            return;
          }
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
      id: "1_month",
      name: "1 Aylık Paket",
      price: 14999,
      currency: "TRY",
      duration: "1 Ay",
      originalPrice: 14999,
      discount: 0,
      features: [
        "Görsel yükleme (AI işleme dahil)",
        "Editör düzenlemesi",
        "Sosyal medya yönetimi",
        "Reklam yönetimi",
        "Aylık SEO",
        "AI Chatbot",
      ],
      popular: false,
      color: "from-blue-500 to-blue-600",
      total_amount: 14999,
    },
    {
      id: "4_months",
      name: "4 Aylık Paket",
      price: 13749,
      currency: "TRY",
      duration: "4 Ay",
      originalPrice: 59996,
      discount: 10,
      features: [
        "Görsel yükleme (AI işleme dahil)",
        "Editör düzenlemesi",
        "Sosyal medya yönetimi",
        "Reklam yönetimi",
        "Aylık SEO",
        "AI Chatbot",
        "💡 %10 İndirim",
      ],
      popular: false,
      color: "from-green-500 to-green-600",
      total_amount: 54999,
    },
    {
      id: "8_months",
      name: "8 Aylık Paket",
      price: 12499,
      currency: "TRY",
      duration: "8 Ay",
      originalPrice: 119992,
      discount: 17,
      features: [
        "Görsel yükleme (AI işleme dahil)",
        "Editör düzenlemesi",
        "Sosyal medya yönetimi",
        "Reklam yönetimi",
        "Aylık SEO",
        "AI Chatbot",
        "💡 %17 İndirim",
      ],
      popular: false,
      color: "from-purple-500 to-purple-600",
      total_amount: 99999,
    },
    {
      id: "12_months",
      name: "12 Aylık Paket",
      price: 11249,
      currency: "TRY",
      duration: "12 Ay",
      originalPrice: 179988,
      discount: 25,
      features: [
        "Görsel yükleme (AI işleme dahil)",
        "Editör düzenlemesi",
        "Sosyal medya yönetimi",
        "Reklam yönetimi",
        "Aylık SEO",
        "AI Chatbot",
        "💡 %25 İndirim",
        "🎯 En Cazip Fiyat",
      ],
      popular: true,
      color: "from-orange-500 to-red-500",
      total_amount: 134999,
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

      const response = await fetch(getApiUrl("/auth/subscription"), {
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

        // Ek hizmetler modalını aç
        setShowAdditionalServices(true);
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

  const handleAdditionalServicesComplete = (services) => {
    setSelectedServices(services);
    console.log("Seçilen ek hizmetler:", services);

    alert(
      `"${selectedPackage}" paketi başarıyla seçildi! Dashboard'a yönlendiriliyorsunuz.`
    );
    navigate("/dashboard");
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
                Dijital Pazarlama Paketlerimiz
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                İşinizin dijital varlığını güçlendirmek için
                <span className="text-blue-600 font-semibold">
                  {" "}
                  kapsamlı dijital pazarlama hizmetlerimiz
                </span>{" "}
                ile büyümeye başlayın
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
                      {pkg.discount > 0 && (
                        <div className="mb-3">
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            %{pkg.discount} İndirim
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                          ₺{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-lg text-slate-500">
                          /{pkg.duration}
                        </span>
                      </div>
                      {pkg.discount > 0 && (
                        <div className="mb-2">
                          <span className="text-slate-400 line-through text-sm">
                            ₺{pkg.originalPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <p className="text-slate-600 text-sm font-semibold">
                        Toplam: ₺{pkg.total_amount.toLocaleString()}
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

                  {/* Removed store_setup section as it's not in the new packages array */}

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
                💡 Neden MetaGrowths Dijital Pazarlama Paketleri?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  AI Destekli Hizmetler
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  7/24 Profesyonel Destek
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Garantili Sonuçlar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200/30 rounded-full animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-slate-200/40 rounded-full animate-float-delayed pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-float-slow pointer-events-none"></div>
      </section>

      <Footer />

      {/* Additional Services Modal */}
      <AdditionalServicesModal
        isOpen={showAdditionalServices}
        onClose={() => setShowAdditionalServices(false)}
        onComplete={handleAdditionalServicesComplete}
      />

      {/* Subscription Exists Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowSubscriptionModal(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="relative p-8 text-center">
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg
                    className="h-8 w-8 text-green-600"
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

                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Aboneliğiniz Mevcut! 🎉
                </h3>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  Zaten aktif bir aboneliğiniz bulunmaktadır. Dashboard'a
                  yönlendirilerek mevcut hizmetlerinizi görüntüleyebilirsiniz.
                </p>

                {/* Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setShowSubscriptionModal(false);
                      navigate("/dashboard");
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Dashboard'a Git
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageSelectionPage;
