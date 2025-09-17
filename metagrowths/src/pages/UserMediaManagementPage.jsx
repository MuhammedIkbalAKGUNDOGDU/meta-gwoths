import { useState, useEffect } from "react";
import { useAuth } from "../utils/auth";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "../config/api";
import Header from "../components/Header";

const UserMediaManagementPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsersMedia, setAllUsersMedia] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMedia, setUserMedia] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, user-detail

  useEffect(() => {
    if ((token && user?.role === "admin") || user?.role === "super_admin") {
      loadAllUsersMedia();
    } else {
      setError("Bu sayfaya erişim yetkiniz yok");
      setLoading(false);
    }
  }, [token, user]);

  const loadAllUsersMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(API_ENDPOINTS.chatAllMedia), {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Medya dosyaları alınamadı");
      }

      const data = await response.json();
      setAllUsersMedia(data.data.users);
    } catch (err) {
      console.error("Load all users media error:", err);
      setError("Medya dosyaları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadUserMedia = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.chatUserMedia}/${userId}`),
        {
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        throw new Error("Kullanıcı medya dosyaları alınamadı");
      }

      const data = await response.json();
      setUserMedia(data.data);
      setActiveTab("user-detail");
    } catch (err) {
      console.error("Load user media error:", err);
      setError("Kullanıcı medya dosyaları yüklenirken bir hata oluştu");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center h-full pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Medya dosyaları yükleniyor...</p>
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
              onClick={loadAllUsersMedia}
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
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Kullanıcı Medya Yönetimi
              </h1>
              <p className="text-slate-600">
                Kullanıcıların gönderdiği resim ve videoları yönetin
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Genel Bakış
              </button>
              {selectedUser && (
                <button
                  onClick={() => setActiveTab("user-detail")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === "user-detail"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Kullanıcı Detayı
                </button>
              )}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsersMedia.map((userData) => (
                  <div
                    key={userData.userId}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedUser(userData);
                      loadUserMedia(userData.userId);
                    }}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                        {userData.userName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {userData.userName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {userData.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Toplam Dosya:</span>
                        <span className="font-medium">
                          {userData.totalFiles}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Resimler:</span>
                        <span className="font-medium text-green-600">
                          {userData.mediaFiles.images.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Videolar:</span>
                        <span className="font-medium text-blue-600">
                          {userData.mediaFiles.videos.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Toplam Boyut:</span>
                        <span className="font-medium">
                          {formatFileSize(userData.totalSize)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <button className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Detayları Görüntüle →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {allUsersMedia.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-4xl mb-4">📁</div>
                  <p className="text-slate-600">
                    Henüz medya dosyası bulunmuyor
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User Detail Tab */}
          {activeTab === "user-detail" && userMedia && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className="text-blue-600 hover:text-blue-800 font-medium mb-4"
                >
                  ← Geri Dön
                </button>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedUser?.userName} - Medya Dosyaları
                </h2>
                <p className="text-slate-600">{selectedUser?.userEmail}</p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {userMedia.summary.totalFiles}
                  </div>
                  <div className="text-sm text-blue-800">Toplam Dosya</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {userMedia.summary.totalImages}
                  </div>
                  <div className="text-sm text-green-800">Resim</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {userMedia.summary.totalVideos}
                  </div>
                  <div className="text-sm text-purple-800">Video</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {userMedia.summary.totalSizeMB} MB
                  </div>
                  <div className="text-sm text-orange-800">Toplam Boyut</div>
                </div>
              </div>

              {/* Media Files */}
              <div className="space-y-6">
                {/* Images */}
                {userMedia.mediaFiles.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Resimler ({userMedia.mediaFiles.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {userMedia.mediaFiles.images.map((image) => (
                        <div
                          key={image.id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-slate-200"
                        >
                          <img
                            src={`${getApiUrl("").replace("/api", "")}${
                              image.fileUrl
                            }`}
                            alt={image.fileName}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <div className="text-xs text-slate-600">
                            <div className="font-medium truncate">
                              {image.fileName}
                            </div>
                            <div>{formatFileSize(image.fileSize)}</div>
                            <div>{formatDate(image.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {userMedia.mediaFiles.videos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Videolar ({userMedia.mediaFiles.videos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userMedia.mediaFiles.videos.map((video) => (
                        <div
                          key={video.id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-slate-200"
                        >
                          <video
                            src={`${getApiUrl("").replace("/api", "")}${
                              video.fileUrl
                            }`}
                            controls
                            className="w-full h-32 object-cover rounded-lg mb-2"
                            preload="metadata"
                          />
                          <div className="text-xs text-slate-600">
                            <div className="font-medium truncate">
                              {video.fileName}
                            </div>
                            <div>{formatFileSize(video.fileSize)}</div>
                            <div>{formatDate(video.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMediaManagementPage;
