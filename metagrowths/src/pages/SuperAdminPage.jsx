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

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "customers", "surveys", "forms"
  const [customers, setCustomers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [webForms, setWebForms] = useState([]);
  const [mobileForms, setMobileForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      await Promise.all([
        fetchCustomers(),
        fetchSurveys(),
        fetchWebForms(),
        fetchMobileForms(),
      ]);
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

  const fetchWebForms = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(getApiUrl("/auth/forms/web/all"), {
        method: "GET",
        headers: getAdminHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setWebForms(data.data.forms || []);
      }
    } catch (error) {
      console.error("Web forms fetch error:", error);
    }
  };

  const fetchMobileForms = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(getApiUrl("/auth/forms/mobile/all"), {
        method: "GET",
        headers: getAdminHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setMobileForms(data.data.forms || []);
      }
    } catch (error) {
      console.error("Mobile forms fetch error:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
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
              onClick={() => setActiveTab("forms")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "forms"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Formlar ({webForms.length + mobileForms.length})
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
                  <p className="text-2xl font-bold text-slate-800">
                    {webForms.length}
                  </p>
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
                  <p className="text-2xl font-bold text-slate-800">
                    {mobileForms.length}
                  </p>
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
                    className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
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

        {activeTab === "forms" && (
          <div className="space-y-8">
            {/* Web Forms */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Web Geliştirme Formları ({webForms.length})
              </h2>

              {webForms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Henüz web formu bulunmuyor</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {webForms.slice(0, 5).map((form) => (
                    <div
                      key={form.id}
                      className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            {form.name} {form.surname}
                          </h3>
                          <p className="text-slate-600">{form.email}</p>
                          <p className="text-sm text-slate-500">
                            Bütçe: {form.budget}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">
                            Tarih: {formatDate(form.created_at)}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              form.status
                            )}`}
                          >
                            {form.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Forms */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Mobil Uygulama Formları ({mobileForms.length})
              </h2>

              {mobileForms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Henüz mobil formu bulunmuyor</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {mobileForms.slice(0, 5).map((form) => (
                    <div
                      key={form.id}
                      className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            {form.name} {form.surname}
                          </h3>
                          <p className="text-slate-600">{form.email}</p>
                          <p className="text-sm text-slate-500">
                            Bütçe: {form.budget}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">
                            Tarih: {formatDate(form.created_at)}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              form.status
                            )}`}
                          >
                            {form.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminPage;
