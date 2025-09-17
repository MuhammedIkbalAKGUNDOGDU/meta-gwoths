import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getApiUrl } from "../config/api";
import {
  isChatAdminAuthenticated,
  chatAdminLogout,
  getChatAdminToken,
  getChatAdminHeaders,
  getChatAdminUser,
  getRoleDisplayName,
} from "../utils/chatAdminAuth";

const ChatAdminPage = () => {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isChatAdminAuthenticated()) {
      navigate("/chat-admin-login");
      return;
    }
    fetchChatRooms();
  }, [navigate]);

  const fetchChatRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getChatAdminToken();
      const response = await fetch(getApiUrl("/chat/rooms/all"), {
        method: "GET",
        headers: getChatAdminHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Chat odaları alınamadı");
      }

      const data = await response.json();
      setChatRooms(data.data.rooms || []);
    } catch (err) {
      console.error("Chat rooms fetch error:", err);
      setError("Chat odaları yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const viewRoomDetails = async (roomId) => {
    try {
      const token = getChatAdminToken();
      const response = await fetch(getApiUrl(`/chat/rooms/${roomId}`), {
        headers: getChatAdminHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Oda detayları alınamadı");
      }

      const data = await response.json();
      setSelectedRoom(data.data.room);
      setParticipants(data.data.participants);
    } catch (err) {
      console.error("Room details error:", err);
      alert("Oda detayları alınırken bir hata oluştu");
    }
  };

  const enterChat = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  const joinRoom = async (roomId) => {
    try {
      const token = getChatAdminToken();
      const response = await fetch(getApiUrl(`/chat/rooms/${roomId}/join`), {
        method: "POST",
        headers: getChatAdminHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Odaya katılınamadı");
      }

      const data = await response.json();
      alert(data.message);
      fetchChatRooms(); // Odaları yenile
    } catch (err) {
      console.error("Join room error:", err);
      alert("Odaya katılırken bir hata oluştu");
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      const token = getChatAdminToken();
      const response = await fetch(getApiUrl(`/chat/rooms/${roomId}/leave`), {
        method: "POST",
        headers: getChatAdminHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Odadan ayrılınamadı");
      }

      const data = await response.json();
      alert(data.message);
      fetchChatRooms(); // Odaları yenile
    } catch (err) {
      console.error("Leave room error:", err);
      alert("Odadan ayrılırken bir hata oluştu");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "advertiser":
        return "bg-green-100 text-green-800";
      case "participant":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "owner":
        return "Oda Sahibi";
      case "admin":
        return "Admin";
      case "editor":
        return "Editör";
      case "advertiser":
        return "Reklamcı";
      case "participant":
        return "Katılımcı";
      default:
        return role;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Chat odaları yükleniyor...</p>
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
            <button
              onClick={() => navigate("/admin")}
              className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              ← Ana Admin Paneli
            </button>
            <h1 className="text-4xl font-bold text-slate-800">Chat Yönetimi</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">
                  {getChatAdminUser()?.first_name}{" "}
                  {getChatAdminUser()?.last_name}
                </p>
                <p className="text-xs text-slate-500">
                  {getRoleDisplayName(getChatAdminUser()?.role)}
                </p>
              </div>
              <button
                onClick={chatAdminLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Çıkış
              </button>
            </div>
          </div>
          <p className="text-slate-600">
            Chat odalarını yönetin ve katılımcıları takip edin
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Chat Rooms Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Chat Odaları ({chatRooms.length})
            </h2>
            <button
              onClick={fetchChatRooms}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Yenile
            </button>
          </div>

          {chatRooms.length === 0 ? (
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
              <p className="text-slate-600">Henüz chat odası bulunmuyor</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Odaları Listesi */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            {room.room_name}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {room.room_description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-500">
                              Oluşturan: {room.creator_first_name}{" "}
                              {room.creator_last_name}
                            </span>
                            <span className="text-xs text-slate-500">
                              • {room.participant_count} katılımcı
                            </span>
                            <span className="text-xs text-slate-500">
                              • {formatDate(room.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewRoomDetails(room.id)}
                            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Detaylar
                          </button>
                          <button
                            onClick={() => enterChat(room.id)}
                            className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Chat'e Gir
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => joinRoom(room.id)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Odaya Katıl
                        </button>
                        <button
                          onClick={() => leaveRoom(room.id)}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Odadan Ayrıl
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seçili Oda Detayları */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Oda Detayları
                  </h3>
                  {selectedRoom ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="font-medium text-slate-800">
                          {selectedRoom.room_name}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {selectedRoom.room_description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-slate-800 mb-2">
                          Katılımcılar
                        </h5>
                        <div className="space-y-2">
                          {participants.map((participant, index) => (
                            <div
                              key={`${participant.user_id}-${index}`}
                              className="flex items-center justify-between p-2 bg-white rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {participant.first_name}{" "}
                                  {participant.last_name}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {participant.email}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getRoleColor(
                                  participant.role
                                )}`}
                              >
                                {getRoleDisplayName(participant.role)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      Detayları görüntülemek için bir oda seçin
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatAdminPage;
