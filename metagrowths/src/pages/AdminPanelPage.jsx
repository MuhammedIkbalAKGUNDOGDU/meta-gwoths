import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  isAdminAuthenticated,
  adminLogout,
  getAdminToken,
  getAdminHeaders,
} from "../utils/adminAuth";

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customers"); // "customers", "surveys"
  const [customers, setCustomers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    "İşletmenizin adı nedir?",
    "Sosyal medya hesap linklerinizi paylaşır mısınız?",
    "Web siteniz veya online satış platformunuz var mı?",
    "Hangi şehir ve semtte hizmet veriyorsunuz?",
    "Ürün/hizmet kategoriniz nedir?",
    "Aylık ortalama reklam bütçeniz nedir?",
    "Hedeflediğiniz müşteri kitlesi kimdir?",
    "Şu anda aktif olarak reklam veriyor musunuz?",
    "Daha önce reklam verdiyseniz, hangi platformları kullandınız?",
    "Daha önceki reklamlarınızdan memnun kaldınız mı?",
    "Şu anda içerik üretimi yapıyor musunuz?",
    "Profesyonel fotoğraf/video çekimi yaptırıyor musunuz?",
    "Ürün/hizmet fiyat aralığınız nedir?",
    "En çok sattığınız 3 ürün veya hizmet nedir?",
    "Hangi günler kampanya yapmayı tercih ediyorsunuz?",
    "Şu an müşterileriniz sizi neden tercih ediyor?",
    "Markanızın ön plana çıkmasını istediğiniz özellikleri nelerdir?",
    "Müşterilerin en çok sorduğu sorular nelerdir?",
    "Şu anda stok durumunuz nasıl?",
    "Sipariş süreçleriniz nasıl işliyor?",
    "Ürün teslimatını nasıl yapıyorsunuz?",
    "Çalıştığınız özel kampanya dönemleri var mı?",
    "Müşteri yorumlarınızı topladığınız platformlar var mı?",
    "Şu anda sizi zorlayan en büyük problem nedir?",
    "Bizim size nasıl bir katkı sağlamamızı beklersiniz?",
  ];

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/adminlogin");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchCustomers(), fetchSurveys()]);
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(getApiUrl("/auth/customers/all"), {
        method: "GET",
        headers: getAdminHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data.customers || []);
      }
    } catch (error) {
      console.error("Customers fetch error:", error);
    }
  };

  const fetchSurveys = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(getApiUrl(API_ENDPOINTS.surveysAll), {
        method: "GET",
        headers: getAdminHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setSurveys(data.data.surveys || []);
      }
    } catch (error) {
      console.error("Surveys fetch error:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const handleSurveyClick = (survey) => {
    setSelectedSurvey(survey);
  };

  const closeSurveyModal = () => {
    setSelectedSurvey(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Veriler yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-slate-800">Admin Panel</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/chat-admin")}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Chat Yönetimi
              </button>
              <button
                onClick={adminLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Admin Çıkış
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "customers"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Müşteriler ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab("surveys")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "surveys"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Anketler ({surveys.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Müşteri Listesi
            </h2>

            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
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
                <p className="text-slate-600">Henüz müşteri bulunmuyor</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {customers.map((customer) => (
                  <div
                    key={customer.customer_id}
                    className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <p className="text-slate-600">{customer.email}</p>
                        {customer.company && (
                          <p className="text-sm text-slate-500">
                            Şirket: {customer.company}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="text-sm text-slate-500">
                            Telefon: {customer.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          Kayıt: {formatDate(customer.created_at)}
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            customer.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "surveys" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Anket Listesi
            </h2>

            {surveys.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-600">Henüz anket cevabı bulunmuyor</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleSurveyClick(survey)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {survey.first_name} {survey.last_name}
                        </h3>
                        <p className="text-slate-600">{survey.email}</p>
                        {survey.company && (
                          <p className="text-sm text-slate-500">
                            Şirket: {survey.company}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          Tamamlanma: {formatDate(survey.completed_at)}
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            survey.is_completed
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {survey.is_completed ? "Tamamlandı" : "Bekliyor"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Survey Detail Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Anket Detayı - {selectedSurvey.first_name}{" "}
                  {selectedSurvey.last_name}
                </h2>
                <button
                  onClick={closeSurveyModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Müşteri Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Ad Soyad</p>
                    <p className="font-semibold">
                      {selectedSurvey.first_name} {selectedSurvey.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">E-posta</p>
                    <p className="font-semibold">{selectedSurvey.email}</p>
                  </div>
                  {selectedSurvey.company && (
                    <div>
                      <p className="text-sm text-slate-500">Şirket</p>
                      <p className="font-semibold">{selectedSurvey.company}</p>
                    </div>
                  )}
                  {selectedSurvey.phone && (
                    <div>
                      <p className="text-sm text-slate-500">Telefon</p>
                      <p className="font-semibold">{selectedSurvey.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">
                      Anket Tamamlanma Tarihi
                    </p>
                    <p className="font-semibold">
                      {formatDate(selectedSurvey.completed_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Survey Answers */}
              {selectedSurvey.answers && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Anket Cevapları
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((question, index) => {
                      const answer = selectedSurvey.answers[index];
                      if (
                        !answer ||
                        (Array.isArray(answer) && answer.length === 0)
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-4 shadow-sm"
                        >
                          <h4 className="font-semibold text-slate-800 mb-2">
                            {index + 1}. {question}
                          </h4>
                          <div className="bg-slate-50 rounded-lg p-3">
                            {Array.isArray(answer) ? (
                              <div className="space-y-1">
                                {answer.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center space-x-2"
                                  >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-slate-700">
                                      {item}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-700">{answer}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPanelPage;
