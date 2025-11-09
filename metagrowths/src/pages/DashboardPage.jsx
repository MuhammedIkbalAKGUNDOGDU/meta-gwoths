import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "../config/api";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSurvey, setHasSurvey] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    checkSurveyStatus();
    checkSubscriptionStatus();
  }, []);

  const checkSurveyStatus = async () => {
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
        customer_id: -1,
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
      };
      console.warn(
        "⚠️ Kullanıcı bilgileri bulunamadı, simüle edilmiş kullanıcı kullanılıyor"
      );
    }

    console.log("Anket durumu kontrol ediliyor...");
    console.log("👤 Giriş Yapan Kullanıcı:", currentUser);

    // Gerçek API isteği yap
    if (token) {
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.survey), {
          method: "GET",
          headers: getAuthHeaders(token),
        });

        if (response.ok) {
          const data = await response.json();
          const surveyCompleted = data.data.survey.is_completed;

          console.log("📊 Dashboard - Anket Durumu Sonucu (API):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            surveyCompleted: surveyCompleted,
            message: surveyCompleted
              ? "Anket tamamlanmış"
              : "Anket tamamlanmamış",
          });

          setHasSurvey(surveyCompleted);
        } else {
          console.log("📊 Dashboard - Anket Durumu Sonucu (API 404):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            surveyCompleted: false,
            message: "Anket bulunamadı (henüz doldurulmamış)",
          });
          setHasSurvey(false);
        }
      } catch (error) {
        console.error("API isteği hatası:", error);
        console.log("📊 Dashboard - Anket Durumu Sonucu (Hata):", {
          user: `${currentUser.first_name} ${currentUser.last_name}`,
          customer_id: currentUser.customer_id,
          email: currentUser.email,
          surveyCompleted: false,
          message: "API hatası - anket doldurulmamış varsayılıyor",
        });
        setHasSurvey(false);
      }
    } else {
      console.log("📊 Dashboard - Anket Durumu Sonucu (Token Yok):", {
        user: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_id: currentUser.customer_id,
        email: currentUser.email,
        surveyCompleted: false,
        message: "Token bulunamadı - anket doldurulmamış varsayılıyor",
      });
      setHasSurvey(false);
    }
  };

  const checkSubscriptionStatus = async () => {
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
        const response = await fetch(getApiUrl(API_ENDPOINTS.subscription), {
          method: "GET",
          headers: getAuthHeaders(token),
        });

        if (response.ok) {
          const data = await response.json();
          const hasActiveSubscription = data.data.subscription !== null;
          const isChatPageSelected = data.data.is_chat_page_selected || false;

          console.log("💳 Dashboard - Abonelik Durumu Sonucu (API):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            hasActiveSubscription: hasActiveSubscription,
            is_chat_page_selected: isChatPageSelected,
            message: hasActiveSubscription
              ? "Aktif abonelik var"
              : "Aktif abonelik yok",
          });

          setHasSubscription(hasActiveSubscription);
          setSubscription(data.data.subscription);

          // Eğer chat sayfası zaten seçilmişse direkt yönlendir
          if (isChatPageSelected) {
            console.log(
              "🚀 Chat sayfası zaten seçilmiş, direkt yönlendiriliyor:",
              {
                user: `${currentUser.first_name} ${currentUser.last_name}`,
                customer_id: currentUser.customer_id,
                is_chat_page_selected: isChatPageSelected,
              }
            );
            navigate(`/chat/${currentUser.customer_id}`);
            return;
          }
        } else if (response.status === 404) {
          console.log("💳 Dashboard - Abonelik Durumu Sonucu (API 404):", {
            user: `${currentUser.first_name} ${currentUser.last_name}`,
            customer_id: currentUser.customer_id,
            email: currentUser.email,
            hasActiveSubscription: false,
            message: "Abonelik bulunamadı (henüz seçilmemiş)",
          });
          setHasSubscription(false);
          setSubscription(null);
        }
      } catch (error) {
        console.error("API isteği hatası:", error);
        console.log("💳 Dashboard - Abonelik Durumu Sonucu (Hata):", {
          user: `${currentUser.first_name} ${currentUser.last_name}`,
          customer_id: currentUser.customer_id,
          email: currentUser.email,
          hasActiveSubscription: false,
          message: "API hatası - abonelik yok varsayılıyor",
        });
        setHasSubscription(false);
        setSubscription(null);
      }
    } else {
      console.log("💳 Dashboard - Abonelik Durumu Sonucu (Token Yok):", {
        user: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_id: currentUser.customer_id,
        email: currentUser.email,
        hasActiveSubscription: false,
        message: "Token bulunamadı - abonelik yok varsayılıyor",
      });
      setHasSubscription(false);
      setSubscription(null);
    }

    setIsLoading(false);
  };

  const handleChatPageSelection = async (roomId) => {
    setIsChatLoading(true);
    setShowChatModal(true);

    try {
      const token = localStorage.getItem("metagrowths_token");
      const userInfo = localStorage.getItem("user_info");

      if (!token || !userInfo) {
        throw new Error("Token veya kullanıcı bilgisi bulunamadı");
      }

      const currentUser = JSON.parse(userInfo);

      console.log("🎯 Chat sayfası seçiliyor...", {
        user: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_id: currentUser.customer_id,
        room_id: roomId,
      });

      // Chat page seçimi API'sini çağır
      const response = await fetch(getApiUrl(API_ENDPOINTS.selectChatPage), {
        method: "POST",
        headers: getAuthHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();

        console.log("✅ Chat sayfası seçimi başarılı:", {
          user: `${currentUser.first_name} ${currentUser.last_name}`,
          customer_id: currentUser.customer_id,
          is_chat_page_selected: data.data.is_chat_page_selected,
          message: data.message,
        });

        // 2 saniye sonra chat sayfasına yönlendir
        setTimeout(() => {
          setShowChatModal(false);
          navigate(`/chat/${currentUser.customer_id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Chat sayfası seçimi başarısız");
      }
    } catch (error) {
      console.error("❌ Chat sayfası seçimi hatası:", error);
      setShowChatModal(false);
      alert("Chat sayfası seçilirken bir hata oluştu: " + error.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 400) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const rooms = [
    {
      id: 1,
      name: "Çalışma Alanı 1",
      capacity: 4,
      occupants: 3,
      status: "available",
    },
    {
      id: 2,
      name: "Çalışma Alanı 2",
      capacity: 4,
      occupants: 3,
      status: "available",
    },
    {
      id: 3,
      name: "Çalışma Alanı 3",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 4,
      name: "Çalışma Alanı 4",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 5,
      name: "Çalışma Alanı 5",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 6,
      name: "Çalışma Alanı 6",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 7,
      name: "Çalışma Alanı 7",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 8,
      name: "Çalışma Alanı 8",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 9,
      name: "Çalışma Alanı 9",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 10,
      name: "Çalışma Alanı 10",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 11,
      name: "Çalışma Alanı 11",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
    {
      id: 12,
      name: "Çalışma Alanı 12",
      capacity: 4,
      occupants: 4,
      status: "full",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "full":
        return "bg-orange-500";
      case "available":
        return "bg-blue-500";
      case "empty":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "full":
        return "Dolu";
      case "available":
        return "Müsait";
      case "empty":
        return "Boş";
      default:
        return "Bilinmiyor";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />
      {/* Sidebar Toggle Button - Absolute positioned below header */}
      <button
        onClick={handleSidebarToggle}
        className="fixed left-4 top-20 z-40 p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
      >
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div
          className={`bg-white/90 backdrop-blur-md border-r border-slate-200 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-80" : "w-0"
          } overflow-hidden`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800">
                Kontrol Paneli
              </h2>
              <button
                onClick={handleSidebarToggle}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl p-4 text-white">
                <h3 className="text-sm font-medium mb-3">
                  Genel İstatistikler
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Toplam Alan:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Dolu Alan:</span>
                    <span className="font-semibold">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Müsait Alan:</span>
                    <span className="font-semibold">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Boş Alan:</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </div>

              {/* Survey Status */}
              {!isLoading && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Anket Durumu
                  </h3>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        hasSurvey ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm text-slate-600">
                      {hasSurvey ? "Anket Tamamlandı" : "Anket Tamamlanmadı"}
                    </span>
                  </div>
                  {!hasSurvey && (
                    <button
                      onClick={() => navigate("/anket")}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Anketi Doldur
                    </button>
                  )}
                </div>
              )}

              {/* Subscription Status */}
              {!isLoading && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Abonelik Durumu
                  </h3>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        hasSubscription ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm text-slate-600">
                      {hasSubscription ? "Aktif Abonelik" : "Abonelik Yok"}
                    </span>
                  </div>
                  {hasSubscription && subscription && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-slate-500">
                        <strong>Paket:</strong> {subscription.package_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        <strong>Fiyat:</strong> ₺{subscription.total_amount}
                      </div>
                      <div className="text-xs text-slate-500">
                        <strong>Bitiş:</strong>{" "}
                        {new Date(subscription.end_date).toLocaleDateString(
                          "tr-TR"
                        )}
                      </div>
                    </div>
                  )}
                  {!hasSubscription && hasSurvey && (
                    <button
                      onClick={() => navigate("/reklam-paket-secim")}
                      className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Paket Seç
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Çalışma Alanı Yönetimi
              </h1>
              <p className="text-slate-600">
                Tüm çalışma alanlarının durumunu takip edin ve yönetin
              </p>
              <p className="text-slate-600 mt-2">
                Seçeceğiniz çalışma alanında sizle iş yapacak kişiler
                bulnumaktadır size özel olarak tanımlanacak herhangi bir fark
                bulunmamaktadır lütfen boş bulunan odaya geçelim
              </p>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {rooms.map((room, index) => (
              <div
                key={room.id}
                className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Room Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {room.name}
                  </h3>
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(
                      room.status
                    )}`}
                  ></div>
                </div>

                {/* Room Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Durum:</span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        room.status === "active"
                          ? "bg-green-100 text-green-700"
                          : room.status === "full"
                          ? "bg-orange-100 text-orange-700"
                          : room.status === "available"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {getStatusText(room.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Kapasite:</span>
                    <span className="text-sm font-medium text-slate-800">
                      {room.occupants}/{room.capacity}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Doluluk Oranı</span>
                    <span>
                      {Math.round((room.occupants / room.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        room.status === "full"
                          ? "bg-orange-500"
                          : room.status === "active"
                          ? "bg-green-500"
                          : room.status === "available"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width: `${(room.occupants / room.capacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {room.status === "available" ? (
                    <button
                      onClick={() => handleChatPageSelection(room.id)}
                      disabled={isChatLoading}
                      className={`flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-slate-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                        isChatLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isChatLoading ? "Katılıyor..." : "Katıl"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed opacity-60"
                    >
                      Bu çalışma alanı dolu şu anda
                    </button>
                  )}
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a6 6 0 110 12 6 6 0 010-12z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />

      {/* Chat Loading Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              {/* Modal Content */}
              <div className="relative p-8 text-center">
                {/* Loading Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Çalışma Alanına Katılıyor... 🚀
                </h3>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  Chat sayfası seçiliyor ve çalışma alanına
                  yönlendiriliyorsunuz. Lütfen bekleyin.
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-slate-700 h-2 rounded-full animate-pulse"></div>
                </div>

                <p className="text-sm text-slate-500">
                  API çağrısı yapılıyor...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
