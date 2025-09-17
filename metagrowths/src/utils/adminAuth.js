// Admin authentication utility functions

// Admin giriş yapmış mı kontrol et
export const isAdminAuthenticated = () => {
  const adminToken = localStorage.getItem("admin_token");
  return !!adminToken;
};

// Admin bilgilerini al
export const getAdminInfo = () => {
  if (!isAdminAuthenticated()) {
    return null;
  }

  try {
    const adminInfo = localStorage.getItem("admin_user");
    return adminInfo ? JSON.parse(adminInfo) : null;
  } catch (error) {
    return null;
  }
};

// Admin çıkış yap - localStorage'daki tüm değerleri temizle
export const adminLogout = () => {
  // localStorage'daki tüm değerleri temizle
  localStorage.clear();

  // Alternatif olarak sessionStorage'ı da temizleyebiliriz
  sessionStorage.clear();

  // Admin login sayfasına yönlendir
  window.location.href = "/adminlogin";
};

// Admin token'ını al
export const getAdminToken = () => {
  return localStorage.getItem("admin_token");
};

// Admin headers oluştur
export const getAdminHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
