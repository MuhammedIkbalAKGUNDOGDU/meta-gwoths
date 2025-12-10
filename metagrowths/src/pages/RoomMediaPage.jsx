import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChatAdminToken, getChatAdminHeaders } from "../utils/chatAdminAuth";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

const RoomMediaPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [media, setMedia] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, image, video
  const [selectedUser, setSelectedUser] = useState("all"); // all, or specific user ID

  useEffect(() => {
    fetchRoomMedia();
  }, [roomId, pagination.page, filterType, selectedUser]);

  const fetchRoomMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getChatAdminToken();
      const headers = getChatAdminHeaders(token);

      console.log("🔍 RoomMediaPage Debug:", {
        roomId,
        token: token ? `${token.substring(0, 20)}...` : "null",
        headers,
        url: getApiUrl(
          `${API_ENDPOINTS.chatRoomMedia}/${roomId}?page=${pagination.page}&limit=${pagination.limit}`
        ),
      });

      const response = await fetch(
        getApiUrl(
          `${API_ENDPOINTS.chatRoomMedia}/${roomId}?page=${pagination.page}&limit=${pagination.limit}`
        ),
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Medya dosyaları alınamadı");
      }

      const data = await response.json();

      if (data.status === "success") {
        setRoom(data.data.room);
        setUsers(data.data.users);
        setMedia(data.data.media);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Bir hata oluştu");
      }

      // Load requests
      const requestsResponse = await fetch(
        getApiUrl(`${API_ENDPOINTS.chatRequests}/${roomId}`),
        {
          method: "GET",
          headers,
        }
      );

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.data.requests || []);
      }
    } catch (error) {
      console.error("Fetch room media error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("tr-TR");
  };

  const downloadFile = (mediaItem) => {
    const link = document.createElement("a");
    link.href = mediaItem.full_url;
    link.download = mediaItem.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openMediaModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.file_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || item.message_type === filterType;
    const matchesUser =
      selectedUser === "all" || item.sender_id.toString() === selectedUser;

    return matchesSearch && matchesType && matchesUser;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Medya dosyaları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/chat-admin")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {room?.room_name} - Medya Dosyaları
              </h1>
              <p className="text-gray-600 mt-1">{room?.room_description}</p>
            </div>
            <button
              onClick={() => navigate("/chat-admin")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
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
                <p className="text-sm font-medium text-gray-600">
                  Kullanıcılar
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Medya
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resimler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {media.filter((m) => m.message_type === "image").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Videolar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {media.filter((m) => m.message_type === "video").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">İstekler</h3>
          </div>
          <div className="p-6">
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Henüz istek bulunmuyor
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg ${
                      request.status === "completed"
                        ? "bg-green-50 border-green-200"
                        : request.status === "in_progress"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>
                            {request.first_name} {request.last_name}
                            {request.company && ` (${request.company})`}
                          </span>
                          <span>•</span>
                          <span>{request.token_cost} token</span>
                          <span>•</span>
                          <span>
                            {new Date(request.created_at).toLocaleDateString(
                              "tr-TR"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            request.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : request.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {request.status === "completed"
                            ? "Tamamlandı"
                            : request.status === "in_progress"
                            ? "Yapılıyor"
                            : "Beklemede"}
                        </span>
                        {request.status !== "completed" && (
                          <button
                            onClick={async () => {
                              try {
                                const token = getChatAdminToken();
                                const headers = getChatAdminHeaders(token);
                                const response = await fetch(
                                  getApiUrl(
                                    `/chat/requests/${request.id}/complete`
                                  ),
                                  {
                                    method: "PUT",
                                    headers,
                                  }
                                );

                                if (response.ok) {
                                  const data = await response.json();
                                  setRequests((prev) =>
                                    prev.map((r) =>
                                      r.id === request.id
                                        ? data.data.request
                                        : r
                                    )
                                  );
                                }
                              } catch (err) {
                                console.error("Complete request error:", err);
                                alert("İstek tamamlanırken bir hata oluştu");
                              }
                            }}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Tamamla
                          </button>
                        )}
                      </div>
                    </div>
                    {request.completed_by_first_name && (
                      <p className="text-xs text-gray-500 mt-2">
                        Tamamlayan: {request.completed_by_first_name}{" "}
                        {request.completed_by_last_name} -{" "}
                        {new Date(request.completed_at).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Kullanıcılar</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users
                .filter((user) => user.role === "customer")
                .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user.first_name.charAt(0)}
                      {user.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.company && (
                      <p className="text-xs text-gray-500">{user.company}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {user.message_count} mesaj
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arama
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Dosya adı ara..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tümü</option>
                  <option value="image">Resimler</option>
                  <option value="video">Videolar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  {users
                    .filter((user) => user.role === "customer")
                    .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} {user.company ? `(${user.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Medya Dosyaları ({filteredMedia.length})
            </h3>
          </div>
          <div className="p-6">
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Medya dosyası bulunamadı
                </h3>
                <p className="text-gray-500">
                  Bu odada henüz medya dosyası paylaşılmamış.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openMediaModal(item)}
                  >
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      {item.message_type === "image" ? (
                        <img
                          src={item.full_url}
                          alt={item.file_name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            // Hata durumunda placeholder göster
                            e.target.style.display = "none";
                            const placeholder = document.createElement("div");
                            placeholder.className =
                              "w-full h-full flex items-center justify-center bg-gray-300 text-gray-600";
                            placeholder.innerHTML = `
                              <div class="text-center">
                                <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                </svg>
                                <p class="text-xs">Resim yüklenemedi</p>
                              </div>
                            `;
                            e.target.parentNode.appendChild(placeholder);
                          }}
                        />
                      ) : (
                        <video
                          src={item.full_url}
                          className="w-full h-full object-cover"
                          muted
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.file_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.sender_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.file_size)} •{" "}
                        {formatDate(item.created_at)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(item);
                        }}
                        className="mt-2 w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        İndir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-gray-700">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.total_pages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMedia.file_name}
                </h3>
                <button
                  onClick={closeMediaModal}
                  className="text-gray-400 hover:text-gray-600"
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
              <div className="mb-4">
                {selectedMedia.message_type === "image" ? (
                  <img
                    src={selectedMedia.full_url}
                    alt={selectedMedia.file_name}
                    className="max-w-full max-h-96 object-contain mx-auto"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <video
                    src={selectedMedia.full_url}
                    controls
                    className="max-w-full max-h-96 mx-auto"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Gönderen:</span>
                  <p className="text-gray-900">{selectedMedia.sender_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">E-posta:</span>
                  <p className="text-gray-900">{selectedMedia.sender_email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Boyut:</span>
                  <p className="text-gray-900">
                    {formatFileSize(selectedMedia.file_size)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tarih:</span>
                  <p className="text-gray-900">
                    {formatDate(selectedMedia.created_at)}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeMediaModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Kapat
                </button>
                <button
                  onClick={() => downloadFile(selectedMedia)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomMediaPage;
