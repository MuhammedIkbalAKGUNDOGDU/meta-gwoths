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
    const userInfo = localStorage.getItem("metagrowths_user");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    return null;
  }
};

// Çıkış yap
export const logout = () => {
  localStorage.removeItem("metagrowths_token");
  localStorage.removeItem("metagrowths_user");
  window.location.href = "/";
};
