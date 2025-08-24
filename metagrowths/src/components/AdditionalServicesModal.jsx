import { useState } from "react";

const AdditionalServicesModal = ({ isOpen, onClose, onComplete }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [isWebFormOpen, setIsWebFormOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [webFormData, setWebFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
  });
  const [mobileFormData, setMobileFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
  });

  const services = [
    {
      id: "website",
      name: "Web Sitesi",
      description: "Profesyonel web sitesi tasarımı ve geliştirme",
      price: "Fiyat belirtilecek",
      icon: "🌐",
    },
    {
      id: "mobile_app",
      name: "Mobil Uygulama",
      description: "iOS ve Android mobil uygulama geliştirme",
      price: "Fiyat belirtilecek",
      icon: "📱",
    },
    {
      id: "store_setup",
      name: "Mağaza Kurulumu (Opsiyonel)",
      description: "E-ticaret mağazası kurulumu ve yapılandırması",
      price: "₺14.999 (tek seferlik)",
      icon: "🛒",
    },
  ];

  const handleServiceToggle = async (serviceId) => {
    if (serviceId === "website") {
      setIsWebFormOpen(true);
      return;
    }

    if (serviceId === "mobile_app") {
      setIsMobileFormOpen(true);
      return;
    }

    if (serviceId === "store_setup") {
      try {
        const token = localStorage.getItem("metagrowths_token");
        const headers = token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" };

        const response = await fetch(
          "http://localhost:5000/api/auth/store-setup-request",
          {
            method: "POST",
            headers,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Mağaza kurulum isteği başarısız");
        }

        alert("Mağaza kurulum isteğiniz başarıyla gönderildi!");
        setSelectedServices((prev) => [...prev, "store_setup"]);
      } catch (error) {
        console.error("Store setup request error:", error);
        alert(
          "Mağaza kurulum isteği gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
      return;
    }

    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleWebFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("metagrowths_token");
      const headers = token
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        : { "Content-Type": "application/json" };

      const response = await fetch("http://localhost:5000/api/auth/web-form", {
        method: "POST",
        headers,
        body: JSON.stringify(webFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join("\n");
          alert(`Form hataları:\n${errorMessages}`);
        } else {
          throw new Error(data.message || "Form gönderimi başarısız");
        }
        return;
      }

      alert("Web sitesi talebiniz başarıyla gönderildi!");
      setIsWebFormOpen(false);
      setSelectedServices((prev) => [...prev, "website"]);
      setWebFormData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        projectDescription: "",
        budget: "",
      });
    } catch (error) {
      console.error("Web form submission error:", error);
      alert("Form gönderimi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleMobileFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("metagrowths_token");
      const headers = token
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        : { "Content-Type": "application/json" };

      const response = await fetch(
        "http://localhost:5000/api/auth/mobile-form",
        {
          method: "POST",
          headers,
          body: JSON.stringify(mobileFormData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join("\n");
          alert(`Form hataları:\n${errorMessages}`);
        } else {
          throw new Error(data.message || "Form gönderimi başarısız");
        }
        return;
      }

      alert("Mobil uygulama talebiniz başarıyla gönderildi!");
      setIsMobileFormOpen(false);
      setSelectedServices((prev) => [...prev, "mobile_app"]);
      setMobileFormData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        projectDescription: "",
        budget: "",
      });
    } catch (error) {
      console.error("Mobile form submission error:", error);
      alert("Form gönderimi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleComplete = () => {
    onComplete(selectedServices);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              🎯 Ek Hizmetler
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <p className="text-gray-600 mt-2">
            Paketinize ek olarak aşağıdaki hizmetlerden istediğinizi
            seçebilirsiniz
          </p>
        </div>

        {/* Services List */}
        <div className="p-6">
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">
                      {service.price}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedServices.includes(service.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedServices.includes(service.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Devam Et
            </button>
          </div>
        </div>

        {/* Web Development Form Modal */}
        {isWebFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-slate-800">
                    Web Geliştirme Teklifi
                  </h2>
                  <button
                    onClick={() => setIsWebFormOpen(false)}
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

                <form onSubmit={handleWebFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ad *
                      </label>
                      <input
                        type="text"
                        required
                        value={webFormData.name}
                        onChange={(e) =>
                          setWebFormData({
                            ...webFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={webFormData.surname}
                        onChange={(e) =>
                          setWebFormData({
                            ...webFormData,
                            surname: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        required
                        value={webFormData.email}
                        onChange={(e) =>
                          setWebFormData({
                            ...webFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={webFormData.phone}
                        onChange={(e) =>
                          setWebFormData({
                            ...webFormData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0555 123 45 67"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Proje Açıklaması *
                    </label>
                    <textarea
                      required
                      value={webFormData.projectDescription}
                      onChange={(e) =>
                        setWebFormData({
                          ...webFormData,
                          projectDescription: e.target.value,
                        })
                      }
                      rows="4"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Web siteniz hakkında detayları paylaşın (e-ticaret, kurumsal site, blog vb.)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tahmini Bütçe *
                    </label>
                    <select
                      required
                      value={webFormData.budget}
                      onChange={(e) =>
                        setWebFormData({
                          ...webFormData,
                          budget: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Bütçe seçiniz...</option>
                      <option value="5k-15k">5.000 TL - 15.000 TL</option>
                      <option value="15k-30k">15.000 TL - 30.000 TL</option>
                      <option value="30k-50k">30.000 TL - 50.000 TL</option>
                      <option value="50k-100k">50.000 TL - 100.000 TL</option>
                      <option value="100k+">100.000 TL+</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsWebFormOpen(false)}
                      className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Teklif Gönder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Mobile App Form Modal */}
        {isMobileFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-slate-800">
                    Mobil Uygulama Teklifi
                  </h2>
                  <button
                    onClick={() => setIsMobileFormOpen(false)}
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

                <form onSubmit={handleMobileFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ad *
                      </label>
                      <input
                        type="text"
                        required
                        value={mobileFormData.name}
                        onChange={(e) =>
                          setMobileFormData({
                            ...mobileFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={mobileFormData.surname}
                        onChange={(e) =>
                          setMobileFormData({
                            ...mobileFormData,
                            surname: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        required
                        value={mobileFormData.email}
                        onChange={(e) =>
                          setMobileFormData({
                            ...mobileFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobileFormData.phone}
                        onChange={(e) =>
                          setMobileFormData({
                            ...mobileFormData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0555 123 45 67"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Proje Açıklaması *
                    </label>
                    <textarea
                      required
                      value={mobileFormData.projectDescription}
                      onChange={(e) =>
                        setMobileFormData({
                          ...mobileFormData,
                          projectDescription: e.target.value,
                        })
                      }
                      rows="4"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Mobil uygulamanız hakkında detayları paylaşın (iOS, Android, hibrit vb.)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tahmini Bütçe *
                    </label>
                    <select
                      required
                      value={mobileFormData.budget}
                      onChange={(e) =>
                        setMobileFormData({
                          ...mobileFormData,
                          budget: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Bütçe seçiniz...</option>
                      <option value="15k-30k">15.000 TL - 30.000 TL</option>
                      <option value="30k-50k">30.000 TL - 50.000 TL</option>
                      <option value="50k-100k">50.000 TL - 100.000 TL</option>
                      <option value="100k-200k">100.000 TL - 200.000 TL</option>
                      <option value="200k+">200.000 TL+</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsMobileFormOpen(false)}
                      className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Teklif Gönder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalServicesModal;
