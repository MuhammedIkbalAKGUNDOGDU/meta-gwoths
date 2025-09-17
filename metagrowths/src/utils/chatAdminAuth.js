// Chat Admin authentication utility functions

export const isChatAdminAuthenticated = () => {
  const token = localStorage.getItem("chatAdminToken");
  const user = localStorage.getItem("chatAdminUser");

  if (!token || !user) {
    return false;
  }

  try {
    const userData = JSON.parse(user);
    // Sadece belirli rollere izin ver
    const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
    return allowedRoles.includes(userData.role);
  } catch (error) {
    console.error("User data parse error:", error);
    return false;
  }
};

export const getChatAdminToken = () => {
  return localStorage.getItem("chatAdminToken");
};

export const getChatAdminUser = () => {
  const user = localStorage.getItem("chatAdminUser");
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("User data parse error:", error);
    return null;
  }
};

export const getChatAdminHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const chatAdminLogout = () => {
  // localStorage'daki tüm değerleri temizle
  localStorage.clear();

  // Alternatif olarak sessionStorage'ı da temizleyebiliriz
  sessionStorage.clear();

  // Chat admin login sayfasına yönlendir
  window.location.href = "/chat-admin-login";
};

export const getRoleDisplayName = (role) => {
  switch (role) {
    case "advertiser":
      return "Reklamcı";
    case "editor":
      return "Editör";
    case "admin":
      return "Admin";
    case "super_admin":
      return "Süper Admin";
    default:
      return role;
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case "advertiser":
      return "bg-green-100 text-green-800";
    case "editor":
      return "bg-blue-100 text-blue-800";
    case "admin":
      return "bg-red-100 text-red-800";
    case "super_admin":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
