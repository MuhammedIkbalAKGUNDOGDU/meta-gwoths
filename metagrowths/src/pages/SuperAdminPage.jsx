import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  isAdminAuthenticated,
  adminLogout,
  getAdminToken,
  getAdminHeaders,
} from "../utils/adminAuth";
import CreateChatUserForm from "../components/CreateChatUserForm";

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "customers", "surveys", "chat-users"
  const [customers, setCustomers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      await Promise.all([fetchCustomers(), fetchSurveys(), fetchChatUsers()]);
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

  const fetchChatUsers = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(getApiUrl("/auth/customers/all"), {
        method: "GET",
        headers: getAdminHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        // Sadece chat yönetimi rolleri olan kullanıcıları filtrele
        const chatUsers = data.data.customers.filter((user) =>
          ["advertiser", "editor", "admin"].includes(user.role)
        );
        setChatUsers(chatUsers);
      }
    } catch (error) {
      console.error("Chat users fetch error:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const openSurveyModal = (survey) => {
    setSelectedSurvey(survey);
  };

  const closeSurveyModal = () => {
    setSelectedSurvey(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "beklemede":
        return "bg-yellow-100 text-yellow-800";
      case "onaylandı":
        return "bg-green-100 text-green-800";
      case "görüşüldü":
        return "bg-blue-100 text-blue-800";
      case "reddedildi":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "advertiser":
        return "bg-green-500";
      case "editor":
        return "bg-blue-500";
      case "admin":
        return "bg-red-500";
      case "super_admin":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "advertiser":
        return "Reklamcı";
      case "editor":
        return "Editör";
      case "admin":
        return "Admin";
      case "super_admin":
        return "Süper Admin";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
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
      <div className="max-w-7xl mx-auto p-6 pt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-slate-800">
              Super Admin Panel
            </h1>
            <button
              onClick={adminLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Admin Çıkış
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Genel Bakış
            </button>
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
            <button
              onClick={() => setActiveTab("chat-users")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "chat-users"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Chat Yönetimi ({chatUsers.length})
            </button>
            <button
              onClick={() => navigate("/admin/tokens")}
              className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300"
            >
              Token Yönetimi
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Toplam Müşteri
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {customers.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Anket Tamamlayan
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {surveys.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Web Formları
                  </p>
                  <p className="text-2xl font-bold text-slate-800">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-orange-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    Mobil Formları
                  </p>
                  <p className="text-2xl font-bold text-slate-800">0</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    onClick={() => openSurveyModal(survey)}
                    className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
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

        {/* Chat Users Tab */}
        {activeTab === "chat-users" && (
          <div className="space-y-8">
            {/* Create Form Modal */}
            {showCreateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">
                      Yeni Chat Yönetimi Hesabı
                    </h3>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-slate-400 hover:text-slate-600"
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

                  <CreateChatUserForm
                    onSuccess={() => {
                      setShowCreateForm(false);
                      fetchChatUsers();
                    }}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Chat Yönetimi Hesapları ({chatUsers.length})
                </h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  + Yeni Hesap Ekle
                </button>
              </div>

              {/* Chat Users List */}
              {chatUsers.length === 0 ? (
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600">
                    Henüz chat yönetimi hesabı bulunmuyor
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {chatUsers.map((user) => (
                    <div
                      key={user.customer_id}
                      className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${getRoleColor(
                              user.role
                            )}`}
                          >
                            <span className="text-lg font-bold text-white">
                              {user.first_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-slate-600">{user.email}</p>
                            <p className="text-sm text-slate-500">
                              Şirket: {user.company || "MetaGrowths"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {getRoleDisplayName(user.role)}
                          </span>
                          <p className="text-sm text-slate-500 mt-2">
                            Oluşturulma: {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Survey Detail Modal */}
        {selectedSurvey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-slate-800">
                    Anket Detayları
                  </h2>
                  <button
                    onClick={closeSurveyModal}
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

                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {selectedSurvey.first_name} {selectedSurvey.last_name}
                  </h3>
                  <p className="text-slate-600">{selectedSurvey.email}</p>
                  <p className="text-sm text-slate-500">
                    Tarih: {formatDate(selectedSurvey.created_at)}
                  </p>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const answer = selectedSurvey[`answer_${index + 1}`];

                    if (
                      !answer ||
                      (Array.isArray(answer) && answer.length === 0)
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
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
                                  <span className="text-slate-700">{item}</span>
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
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminPage;
