// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

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

  // Subscription endpoints
  subscription: "/auth/subscription",
  createSubscription: "/auth/subscription",

  // Chat page selection
  selectChatPage: "/auth/select-chat-page",

  // Token endpoints
  tokens: "/auth/tokens",
  tokenTransactions: "/auth/tokens/transactions",
  useTokens: "/auth/tokens/use",
  purchaseTokens: "/auth/tokens/purchase",
  allTokens: "/auth/tokens/all",
  allTokenTransactions: "/auth/tokens/transactions/all",
  // Customer management endpoints
  updateCustomerStatus: "/auth/customers",
  // Chat endpoints
  chatRooms: "/chat/rooms",
  chatRoomsAll: "/chat/rooms/all",
  chatRoomDetails: "/chat/rooms",
  chatMessages: "/chat/messages",
  chatMediaMessage: "/chat/messages/media",
  chatUserMedia: "/chat/media/user",
  chatRoomMedia: "/chat/media/room",
  joinChatRoom: "/chat/rooms",
  leaveChatRoom: "/chat/rooms",
  removeParticipant: "/chat/rooms",
  // Chat request endpoints
  chatRequests: "/chat/requests",
  chatRequestsAll: "/chat/requests/all",

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
