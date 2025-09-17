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

const FormsAdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("web"); // "web" veya "mobile"
  const [webForms, setWebForms] = useState([]);
  const [mobileForms, setMobileForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
      await Promise.all([fetchWebForms(), fetchMobileForms()]);
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setIsLoading(false);
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

  const updateFormStatus = async (formType, formId, newStatus) => {
    setIsUpdating(true);
    try {
      const token = getAdminToken();
      const response = await fetch(
        getApiUrl(`/auth/forms/${formType}/${formId}/status`),
        {
          method: "PUT",
          headers: getAdminHeaders(token),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        alert("Form durumu başarıyla güncellendi!");
        fetchData(); // Verileri yenile
      } else {
        const data = await response.json();
        alert(data.message || "Durum güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Durum güncellenirken hata oluştu");
    } finally {
      setIsUpdating(false);
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

  const handleFormClick = (form) => {
    setSelectedForm(form);
  };

  const closeFormModal = () => {
    setSelectedForm(null);
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
              Forms Admin Panel
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
              onClick={() => setActiveTab("web")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "web"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Web Formları ({webForms.length})
            </button>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "mobile"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Mobil Formları ({mobileForms.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "web" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Web Geliştirme Formları
            </h2>

            {webForms.length === 0 ? (
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
                <p className="text-slate-600">Henüz web formu bulunmuyor</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {webForms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleFormClick(form)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {form.name} {form.surname}
                        </h3>
                        <p className="text-slate-600">{form.email}</p>
                        <p className="text-sm text-slate-500">
                          Telefon: {form.phone}
                        </p>
                        <p className="text-sm text-slate-500">
                          Bütçe: {form.budget}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          Tarih: {formatDate(form.created_at)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              form.status
                            )}`}
                          >
                            {form.status}
                          </span>
                          <select
                            value={form.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateFormStatus("web", form.id, e.target.value);
                            }}
                            disabled={isUpdating}
                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="beklemede">Beklemede</option>
                            <option value="onaylandı">Onaylandı</option>
                            <option value="görüşüldü">Görüşüldü</option>
                            <option value="reddedildi">Reddedildi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "mobile" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Mobil Uygulama Formları
            </h2>

            {mobileForms.length === 0 ? (
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-600">Henüz mobil formu bulunmuyor</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mobileForms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleFormClick(form)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {form.name} {form.surname}
                        </h3>
                        <p className="text-slate-600">{form.email}</p>
                        <p className="text-sm text-slate-500">
                          Telefon: {form.phone}
                        </p>
                        <p className="text-sm text-slate-500">
                          Bütçe: {form.budget}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">
                          Tarih: {formatDate(form.created_at)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              form.status
                            )}`}
                          >
                            {form.status}
                          </span>
                          <select
                            value={form.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateFormStatus(
                                "mobile",
                                form.id,
                                e.target.value
                              );
                            }}
                            disabled={isUpdating}
                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="beklemede">Beklemede</option>
                            <option value="onaylandı">Onaylandı</option>
                            <option value="görüşüldü">Görüşüldü</option>
                            <option value="reddedildi">Reddedildi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Detail Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Form Detayı - {selectedForm.name} {selectedForm.surname}
                </h2>
                <button
                  onClick={closeFormModal}
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

              {/* Form Info */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Form Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Ad Soyad</p>
                    <p className="font-semibold">
                      {selectedForm.name} {selectedForm.surname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">E-posta</p>
                    <p className="font-semibold">{selectedForm.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Telefon</p>
                    <p className="font-semibold">{selectedForm.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Bütçe</p>
                    <p className="font-semibold">{selectedForm.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Durum</p>
                    <p className="font-semibold">{selectedForm.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Oluşturulma Tarihi</p>
                    <p className="font-semibold">
                      {formatDate(selectedForm.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Proje Açıklaması
                </h3>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selectedForm.project_description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FormsAdminPage;
