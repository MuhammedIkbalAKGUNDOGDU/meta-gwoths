import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Hızlı İşlemler
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                    Rapor Oluştur
                  </button>
                  <button className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                    Ayarlar
                  </button>
                  <button className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                    Yardım
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">
                      Çalışma Alanı 1 müsait
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">
                      Çalışma Alanı 2 müsait
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">
                      Çalışma Alanı 3 doldu
                    </span>
                  </div>
                </div>
              </div>
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
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSidebarToggle}
                className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-white transition-all duration-200 shadow-sm"
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
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {rooms.map((room, index) => (
              <div
                key={room.id}
                className={`group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-slate-200/50 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Room Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-800">
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
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-slate-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                      Katıl
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
    </div>
  );
};

export default DashboardPage;
