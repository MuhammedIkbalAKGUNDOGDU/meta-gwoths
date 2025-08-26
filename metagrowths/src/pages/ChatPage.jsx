import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "reklamcı",
      message: "Merhaba! Yeni kampanya için fikirlerimizi paylaşalım.",
      timestamp: "10:30",
      avatar: "🎯",
    },
    {
      id: 2,
      sender: "editör",
      message: "Harika! Hangi hedef kitleyi hedefliyoruz?",
      timestamp: "10:32",
      avatar: "✏️",
    },
    {
      id: 3,
      sender: "tasarımcı",
      message: "Görsel konseptler hazırlayabilirim.",
      timestamp: "10:35",
      avatar: "🎨",
    },
    {
      id: 4,
      sender: "user",
      message: "Mükemmel! Hemen başlayalım.",
      timestamp: "10:37",
      avatar: "👤",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    checkUserAccess();
  }, [userId]);

  const checkUserAccess = () => {
    const userInfo = localStorage.getItem("user_info");
    if (!userInfo) {
      navigate("/login");
      return;
    }

    try {
      const currentUser = JSON.parse(userInfo);
      const currentUserId = currentUser.customer_id.toString();

      // Sadece giriş yapan kullanıcı kendi chat sayfasına erişebilir
      if (userId && userId !== currentUserId) {
        console.log("🚫 Yetkisiz erişim:", {
          requested_user_id: userId,
          current_user_id: currentUserId,
          user: `${currentUser.first_name} ${currentUser.last_name}`,
        });
        navigate("/dashboard");
        return;
      }

      console.log("✅ Chat sayfası erişimi onaylandı:", {
        user_id: userId,
        current_user: `${currentUser.first_name} ${currentUser.last_name}`,
        customer_id: currentUser.customer_id,
      });
    } catch (error) {
      console.error("Kullanıcı bilgileri parse edilemedi:", error);
      navigate("/login");
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "user",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: "👤",
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const participants = [
    {
      id: 1,
      name: "Reklamcı",
      role: "Reklam Uzmanı",
      avatar: "🎯",
      status: "online",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Editör",
      role: "İçerik Editörü",
      avatar: "✏️",
      status: "online",
      color: "bg-green-500",
    },
    {
      id: 3,
      name: "Tasarımcı",
      role: "Grafik Tasarımcı",
      avatar: "🎨",
      status: "online",
      color: "bg-purple-500",
    },
    {
      id: 4,
      name: "Sen",
      role: "Proje Yöneticisi",
      avatar: "👤",
      status: "online",
      color: "bg-orange-500",
    },
  ];

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
              <h2 className="text-xl font-bold text-slate-800">Proje Ekibi</h2>
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

            {/* Participants */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Katılımcılar
              </h3>
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                      {participant.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 ${participant.color} rounded-full border-2 border-white`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-800">
                      {participant.name}
                    </h4>
                    <p className="text-xs text-slate-600">{participant.role}</p>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Çevrimiçi
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Hızlı İşlemler
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                  📁 Dosya Paylaş
                </button>
                <button className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                  📅 Toplantı Planla
                </button>
                <button className="w-full text-left p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                  📊 Rapor Oluştur
                </button>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl p-4 text-white">
              <h3 className="text-sm font-medium mb-3">Proje Bilgileri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Proje:</span>
                  <span className="font-semibold">Meta Growth</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Durum:</span>
                  <span className="font-semibold">Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bitiş:</span>
                  <span className="font-semibold">15 Aralık</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">
                  Proje Ekibi Sohbeti
                </h1>
                <p className="text-slate-600">
                  4 kişi çevrimiçi • Son mesaj 2 dakika önce
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200">
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
                      d="M15 17h5l-5 5v-5z"
                    />
                  </svg>
                </button>
                <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200">
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a6 6 0 110 12 6 6 0 010-12z"
                    />
                  </svg>
                </button>
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
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div
                      className={`${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      } rounded-2xl px-4 py-3 shadow-sm border border-slate-200`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium opacity-75">
                          {message.sender === "user"
                            ? "Sen"
                            : message.sender.charAt(0).toUpperCase() +
                              message.sender.slice(1)}
                        </span>
                        <span className="text-xs opacity-60">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-slate-200 p-6">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="w-full p-4 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="1"
                  style={{ minHeight: "60px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-4 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
