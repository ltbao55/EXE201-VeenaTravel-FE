// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:5001/api",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
  },

  // Destinations
  DESTINATIONS: {
    LIST: "/destinations",
    DETAIL: "/destinations/:id",
    SEARCH: "/destinations/search",
    POPULAR: "/destinations/popular",
  },

  // Trips
  TRIPS: {
    LIST: "/trips",
    CREATE: "/trips",
    DETAIL: "/trips/:id",
    UPDATE: "/trips/:id",
    DELETE: "/trips/:id",
  },

  // Chat
  CHAT: {
    SEND: "/chat",
    HISTORY: "/chat/history",
  },
  
  // Chat Sessions
  CHAT_SESSIONS: {
    LIST: '/chat-sessions',
    DETAIL: '/chat-sessions/:id',
    BY_SESSION_ID: '/chat-sessions/session/:sessionId',
    USER_SESSIONS: '/chat-sessions/user/:userId',
    CREATE: '/chat-sessions',
    UPDATE: '/chat-sessions/:id',
    DELETE: '/chat-sessions/:id',
  },
  
  // User
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    PREFERENCES: "/user/preferences",
  },

  // Users management (Dashboard)
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    DETAIL: "/users/:id",
    UPDATE: "/users/:id",
    DELETE: "/users/:id",
  },
};

// Helper function to replace URL parameters
export const buildUrl = (
  endpoint: string,
  params: Record<string, string | number> = {}
) => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  return url;
};
