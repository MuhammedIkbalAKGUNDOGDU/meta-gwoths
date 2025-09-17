import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "../components/Header";
import TokenInfo from "../components/TokenInfo";
import TokenTransactions from "../components/TokenTransactions";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../utils/auth";
import {
  isChatAdminAuthenticated,
  getChatAdminToken,
  getChatAdminHeaders,
  getChatAdminUser,
} from "../utils/chatAdminAuth";

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'

  useEffect(() => {
    setIsVisible(true);
    checkUserAccess();
    if (token) {
      initializeChat();
    }
  }, [userId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const checkUserAccess = () => {
    // Chat admin kullanıcısı kontrolü
    if (isChatAdminAuthenticated()) {
      const chatAdminUser = getChatAdminUser();
      console.log("✅ Chat Admin erişimi:", {
        room_id: userId,
        current_user: `${chatAdminUser.first_name} ${chatAdminUser.last_name}`,
        customer_id: chatAdminUser.customer_id,
        role: chatAdminUser.role,
      });
      return;
    }

    // Normal kullanıcı kontrolü
    if (!user) {
      navigate("/login");
      return;
    }

    const currentUserId = user.customer_id.toString();

    // Eğer userId bir sayı ise (oda ID'si), bu chat yönetimi sayfasından geliyor
    if (userId && !isNaN(userId)) {
      console.log("✅ Chat odası erişimi:", {
        room_id: userId,
        current_user: `${user.first_name} ${user.last_name}`,
        customer_id: user.customer_id,
      });
      return;
    }

    // Eğer userId kullanıcı ID'si ise, sadece kendi odasına erişebilir
    if (userId && userId !== currentUserId) {
      console.log("🚫 Yetkisiz erişim:", {
        requested_user_id: userId,
        current_user_id: currentUserId,
        user: `${user.first_name} ${user.last_name}`,
      });
      navigate("/dashboard");
      return;
    }

    console.log("✅ Chat sayfası erişimi onaylandı:", {
      user_id: userId,
      current_user: `${user.first_name} ${user.last_name}`,
      customer_id: user.customer_id,
    });
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chat admin kullanıcısı kontrolü
      if (isChatAdminAuthenticated()) {
        if (userId && !isNaN(userId)) {
          const roomId = parseInt(userId);
          await loadRoomDetails(roomId);
          initializeSocket(roomId);
          return;
        }
      }

      // Normal kullanıcı kontrolü
      if (token) {
        // Eğer userId bir sayı ise (oda ID'si), direkt o odaya bağlan
        if (userId && !isNaN(userId)) {
          const roomId = parseInt(userId);
          await loadRoomDetails(roomId);
          initializeSocket(roomId);
          return;
        }
      }

      // Get user's chat rooms
      const roomsResponse = await fetch(getApiUrl(API_ENDPOINTS.chatRooms), {
        headers: getAuthHeaders(token),
      });

      if (!roomsResponse.ok) {
        throw new Error("Chat odaları alınamadı");
      }

      const roomsData = await roomsResponse.json();

      if (roomsData.data.rooms.length === 0) {
        setError("Henüz chat odanız bulunmuyor");
        setLoading(false);
        return;
      }

      // Get the first room (user's own room)
      const userRoom = roomsData.data.rooms[0];
      setCurrentRoom(userRoom);

      // Get room details and participants
      await loadRoomDetails(userRoom.id);

      // Initialize WebSocket connection
      initializeSocket(userRoom.id);
    } catch (err) {
      console.error("Chat initialization error:", err);
      setError("Chat başlatılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadRoomDetails = async (roomId) => {
    try {
      // Chat admin kullanıcısı için özel headers
      let headers;
      if (isChatAdminAuthenticated()) {
        const chatAdminToken = getChatAdminToken();
        headers = getChatAdminHeaders(chatAdminToken);
        console.log("🔍 Chat Admin Debug:", {
          isAuthenticated: isChatAdminAuthenticated(),
          token: chatAdminToken
            ? `${chatAdminToken.substring(0, 20)}...`
            : "null",
          user: getChatAdminUser(),
          headers: headers,
        });
      } else {
        headers = getAuthHeaders(token);
        console.log("🔍 Normal User Debug:", {
          token: token ? `${token.substring(0, 20)}...` : "null",
          user: user,
        });
      }

      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.chatRoomDetails}/${roomId}`),
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Oda detayları alınamadı");
      }

      const data = await response.json();
      setCurrentRoom(data.data.room);
      setParticipants(data.data.participants);
      setUserRole(data.data.user_role);

      // Load messages
      await loadMessages(roomId);
    } catch (err) {
      console.error("Load room details error:", err);
      setError("Oda detayları yüklenirken bir hata oluştu");
    }
  };

  const loadMessages = async (roomId) => {
    try {
      // Chat admin kullanıcısı için özel headers
      let headers;
      if (isChatAdminAuthenticated()) {
        const chatAdminToken = getChatAdminToken();
        headers = getChatAdminHeaders(chatAdminToken);
      } else {
        headers = getAuthHeaders(token);
      }

      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.chatMessages}/${roomId}`),
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error("Mesajlar alınamadı");
      }

      const data = await response.json();
      setMessages(data.data.messages);
    } catch (err) {
      console.error("Load messages error:", err);
      setError("Mesajlar yüklenirken bir hata oluştu");
    }
  };

  const initializeSocket = (roomId) => {
    // Chat admin kullanıcısı için özel token
    let authToken;
    if (isChatAdminAuthenticated()) {
      authToken = getChatAdminToken();
    } else {
      authToken = token;
    }

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: {
        token: authToken,
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      socketRef.current.emit("join_room", { roomId });
    });

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("user_typing", (data) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((user) => user.userId !== data.userId);
        return [...filtered, { userId: data.userId, userName: data.userName }];
      });
    });

    socketRef.current.on("user_stopped_typing", (data) => {
      setTypingUsers((prev) =>
        prev.filter((user) => user.userId !== data.userId)
      );
    });

    socketRef.current.on("user_joined", (data) => {
      setParticipants((prev) => {
        const existing = prev.find((p) => p.user_id === data.userId);
        if (!existing) {
          return [...prev, data.user];
        }
        return prev;
      });
    });

    socketRef.current.on("user_left", (data) => {
      setParticipants((prev) => prev.filter((p) => p.user_id !== data.userId));
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    try {
      // Chat admin kullanıcısı için özel headers
      let headers;
      if (isChatAdminAuthenticated()) {
        const chatAdminToken = getChatAdminToken();
        headers = {
          ...getChatAdminHeaders(chatAdminToken),
          "Content-Type": "application/json",
        };
      } else {
        headers = {
          ...getAuthHeaders(token),
          "Content-Type": "application/json",
        };
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.chatMessages), {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          room_id: currentRoom.id,
          message_content: newMessage.trim(),
          message_type: "text",
        }),
      });

      if (!response.ok) {
        throw new Error("Mesaj gönderilemedi");
      }

      const data = await response.json();

      // Add message to local state
      setMessages((prev) => [...prev, data.data.message]);
      setNewMessage("");

      // Emit typing stop
      if (socketRef.current) {
        socketRef.current.emit("stop_typing", { roomId: currentRoom.id });
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError("Mesaj gönderilirken bir hata oluştu");
    }
  };

  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!socketRef.current || !currentRoom) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit("typing", { roomId: currentRoom.id });
    }

    // Clear typing indicator after 3 seconds
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit("stop_typing", { roomId: currentRoom.id });
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("Dosya 50MB'dan büyük olamaz");
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Sadece resim ve video dosyaları yüklenebilir");
        return;
      }

      setSelectedMedia(file);
      setMediaType(file.type.startsWith("video/") ? "video" : "image");

      // Önizleme oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMedia = async () => {
    if (!selectedMedia || !currentRoom) return;

    try {
      setIsUploadingMedia(true);
      setError(null);

      // Chat admin kullanıcısı için özel headers
      let headers;
      if (isChatAdminAuthenticated()) {
        const chatAdminToken = getChatAdminToken();
        headers = getChatAdminHeaders(chatAdminToken);
      } else {
        headers = getAuthHeaders(token);
      }

      // FormData oluştur
      const formData = new FormData();
      formData.append("media", selectedMedia);
      formData.append("room_id", currentRoom.id);
      formData.append("message_content", newMessage.trim() || "");

      // Authorization header'ını ayrı olarak ekle (FormData ile çakışmaması için)
      const response = await fetch(getApiUrl(API_ENDPOINTS.chatMediaMessage), {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Medya gönderilemedi");
      }

      const data = await response.json();

      // Add message to local state
      setMessages((prev) => [...prev, data.data.message]);
      setNewMessage("");
      setSelectedMedia(null);
      setMediaPreview(null);
      setMediaType(null);

      // Emit typing stop
      if (socketRef.current) {
        socketRef.current.emit("stop_typing", { roomId: currentRoom.id });
      }

      // Socket ile mesajı broadcast et
      if (socketRef.current) {
        socketRef.current.emit("send_message", {
          roomId: currentRoom.id,
          messageContent: data.data.message.message_content || "",
          messageType: mediaType,
          replyToMessageId: null,
        });
      }
    } catch (err) {
      console.error("Send media error:", err);
      setError("Medya gönderilirken bir hata oluştu");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center h-full pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Chat yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center h-full pt-16">
          <div className="text-center">
            <div className="text-red-600 text-2xl mb-4">⚠️</div>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={initializeChat}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />
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
                {currentRoom?.room_name || "Chat Odası"}
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

            {/* Participants */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Katılımcılar ({participants.length}/4)
              </h3>
              {participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                      {participant.first_name?.charAt(0) || "👤"}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                        participant.is_online ? "bg-green-500" : "bg-gray-400"
                      } rounded-full border-2 border-white`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-800">
                      {participant.first_name} {participant.last_name}
                    </h4>
                    <p className="text-xs text-slate-600 capitalize">
                      {participant.role}
                    </p>
                    {participant.company && (
                      <p className="text-xs text-slate-500">
                        {participant.company}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {participant.is_online ? "Çevrimiçi" : "Çevrimdışı"}
                  </div>
                </div>
              ))}
            </div>

            {/* Token Information */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
              <TokenInfo compact={true} />
            </div>

            {/* Token Transactions */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
              <TokenTransactions compact={true} limit={3} />
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
                  {currentRoom?.room_name || "Chat Odası"}
                </h1>
                <p className="text-slate-600">
                  {participants.filter((p) => p.is_online).length} kişi
                  çevrimiçi
                  {typingUsers.length > 0 && (
                    <span className="ml-2 text-blue-600">
                      • {typingUsers.map((u) => u.userName).join(", ")}{" "}
                      yazıyor...
                    </span>
                  )}
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
              {messages.map((message) => {
                // Chat admin kullanıcısı için özel kontrol
                const currentUser = isChatAdminAuthenticated()
                  ? getChatAdminUser()
                  : user;
                const isOwnMessage =
                  message.sender_id === currentUser?.customer_id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                        {message.first_name?.charAt(0) || "👤"}
                      </div>
                      <div
                        className={`${
                          isOwnMessage ? "bg-blue-600 text-white" : "bg-white"
                        } rounded-2xl px-4 py-3 shadow-sm border border-slate-200`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {isOwnMessage
                              ? "Sen"
                              : message.display_name ||
                                `${message.first_name} ${message.last_name}`}
                          </span>
                          <span className="text-xs opacity-60">
                            {new Date(message.created_at).toLocaleTimeString(
                              "tr-TR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        {/* Medya mesajı (Resim/Video) */}
                        {message.message_type === "image" &&
                          message.file_url && (
                            <div className="mb-2">
                              <img
                                src={`${getApiUrl("").replace("/api", "")}${
                                  message.file_url
                                }`}
                                alt={message.file_name || "Resim"}
                                className="max-w-xs rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                                onClick={() =>
                                  window.open(
                                    `${getApiUrl("").replace("/api", "")}${
                                      message.file_url
                                    }`,
                                    "_blank"
                                  )
                                }
                              />
                              {message.file_name && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {message.file_name}
                                </p>
                              )}
                            </div>
                          )}

                        {/* Video mesajı */}
                        {message.message_type === "video" &&
                          message.file_url && (
                            <div className="mb-2">
                              <video
                                src={`${getApiUrl("").replace("/api", "")}${
                                  message.file_url
                                }`}
                                controls
                                className="max-w-xs rounded-lg shadow-sm"
                                preload="metadata"
                                crossOrigin="anonymous"
                              >
                                Tarayıcınız video oynatmayı desteklemiyor.
                              </video>
                              {message.file_name && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {message.file_name}
                                </p>
                              )}
                            </div>
                          )}

                        {/* Metin mesajı */}
                        {message.message_content && (
                          <p className="text-sm">{message.message_content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-slate-200 p-6">
            {/* Medya Önizleme */}
            {mediaPreview && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {mediaType === "video" ? "Video" : "Resim"} Önizleme
                  </span>
                  <button
                    onClick={handleRemoveMedia}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {mediaType === "video" ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="max-w-xs rounded-lg shadow-sm"
                    preload="metadata"
                    crossOrigin="anonymous"
                  >
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Önizleme"
                    className="max-w-xs rounded-lg shadow-sm"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
            )}

            <div className="flex items-end space-x-3">
              {/* Medya Seçme Butonu */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
                  title="Resim/Video Gönder"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </label>
              </div>

              {/* Mesaj Input */}
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="w-full p-4 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="1"
                  style={{ minHeight: "60px", maxHeight: "120px" }}
                />
              </div>

              {/* Gönder Butonu */}
              <button
                onClick={selectedMedia ? handleSendMedia : handleSendMessage}
                disabled={
                  (!newMessage.trim() && !selectedMedia) || isUploadingMedia
                }
                className="p-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                title="Gönder"
              >
                {isUploadingMedia ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
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
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
