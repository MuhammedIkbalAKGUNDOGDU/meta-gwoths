// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  register: "/auth/register",
  login: "/auth/login",
  profile: "/auth/profile",
  updateProfile: "/auth/profile",

  // Form endpoints
  webForm: "/auth/web-form",
  mobileForm: "/auth/mobile-form",

  // Survey endpoints
  survey: "/auth/survey",
  surveysAll: "/auth/surveys/all",

  // Health check
  health: "/health",
};

// Full URL'leri oluştur
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Default headers
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
});

// Auth headers (JWT token ile)
export const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});
