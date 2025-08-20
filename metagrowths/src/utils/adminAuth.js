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

// Admin çıkış yap
export const adminLogout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  window.location.href = "/adminlogin";
};

// Admin token'ını al
export const getAdminToken = () => {
  return "admin_token_123"; // Sabit admin token
};

// Admin headers oluştur
export const getAdminHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
