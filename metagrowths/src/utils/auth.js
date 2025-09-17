import { useState, useEffect } from "react";

// Basit token kontrolü - güvenlik kontrolü yok
export const checkTokenValidity = () => {
  const token = localStorage.getItem("metagrowths_token");
  return !!token; // Token varsa true, yoksa false
};

// Kullanıcı giriş yapmış mı kontrol et
export const isAuthenticated = () => {
  return checkTokenValidity();
};

// Kullanıcı bilgilerini al
export const getUserInfo = () => {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const userInfo = localStorage.getItem("user_info");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    return null;
  }
};

// Çıkış yap - localStorage'daki tüm değerleri temizle
export const logout = () => {
  // localStorage'daki tüm değerleri temizle
  localStorage.clear();

  // Alternatif olarak sessionStorage'ı da temizleyebiliriz
  sessionStorage.clear();

  // Ana sayfaya yönlendir
  window.location.href = "/";
};

// React hook for authentication
export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("metagrowths_token"));
  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem("user_info");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("metagrowths_token"));
      try {
        const userInfo = localStorage.getItem("user_info");
        setUser(userInfo ? JSON.parse(userInfo) : null);
      } catch (error) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    token,
    user,
    isAuthenticated: !!token,
    logout,
  };
};
