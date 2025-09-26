import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { getChatAdminHeaders, getChatAdminToken } from "../utils/chatAdminAuth";

const UserMediaPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [media, setMedia] = useState([]);
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

  useEffect(() => {
    if (userId) {
      fetchUserMedia();
    }
  }, [userId, pagination.page, filterType]);

  const fetchUserMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getChatAdminToken();
      const headers = getChatAdminHeaders(token);

      console.log("🔍 UserMediaPage Debug:", {
        userId,
        token: token ? `${token.substring(0, 20)}...` : "null",
        headers,
        url: getApiUrl(
          `${API_ENDPOINTS.chatUserMedia}/${userId}?page=${pagination.page}&limit=${pagination.limit}`
        ),
      });

      const response = await fetch(
        getApiUrl(
          `${API_ENDPOINTS.chatUserMedia}/${userId}?page=${pagination.page}&limit=${pagination.limit}`
        ),
        { headers }
      );

      if (!response.ok) {
        throw new Error("Medya dosyaları alınamadı");
      }

      const data = await response.json();

      if (data.status === "success") {
        setUser(data.data.user);
        setMedia(data.data.media);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || "Veri alınamadı");
      }
    } catch (err) {
      console.error("Fetch user media error:", err);
      setError(err.message);
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
    const matchesFilter =
      filterType === "all" || item.message_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/chat-admin")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Medya Dosyaları
              </h1>
              {user && (
                <p className="text-slate-600">
                  {user.full_name} ({user.email}) - Toplam {pagination.total}{" "}
                  dosya
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/chat-admin")}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Dosya adında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Dosyalar</option>
                <option value="image">Sadece Resimler</option>
                <option value="video">Sadece Videolar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-slate-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              Medya dosyası bulunamadı
            </h3>
            <p className="text-slate-500">
              {searchTerm || filterType !== "all"
                ? "Arama kriterlerinize uygun dosya bulunamadı."
                : "Bu kullanıcının henüz medya dosyası yok."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Media Preview */}
                <div
                  className="aspect-square bg-slate-100 cursor-pointer relative group"
                  onClick={() => openMediaModal(item)}
                >
                  {item.message_type === "image" ? (
                    <img
                      src={item.full_url}
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <video
                      src={item.full_url}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <h3
                    className="font-medium text-slate-800 truncate mb-1"
                    title={item.file_name}
                  >
                    {item.file_name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">
                    {formatFileSize(item.file_size)} •{" "}
                    {formatDate(item.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openMediaModal(item)}
                      className="flex-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Görüntüle
                    </button>
                    <button
                      onClick={() => downloadFile(item)}
                      className="flex-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      İndir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Önceki
              </button>

              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {pagination.page} / {pagination.total_pages}
              </span>

              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.total_pages}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}

        {/* Media Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 truncate">
                  {selectedMedia.file_name}
                </h3>
                <button
                  onClick={closeMediaModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
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

              <div className="p-4">
                <div className="mb-4">
                  {selectedMedia.message_type === "image" ? (
                    <img
                      src={selectedMedia.full_url}
                      alt={selectedMedia.file_name}
                      className="max-w-full max-h-[60vh] object-contain mx-auto"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <video
                      src={selectedMedia.full_url}
                      controls
                      className="max-w-full max-h-[60vh] mx-auto"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <p>Boyut: {formatFileSize(selectedMedia.file_size)}</p>
                    <p>Tarih: {formatDate(selectedMedia.created_at)}</p>
                    <p>
                      Tip:{" "}
                      {selectedMedia.message_type === "image"
                        ? "Resim"
                        : "Video"}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadFile(selectedMedia)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    İndir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMediaPage;
