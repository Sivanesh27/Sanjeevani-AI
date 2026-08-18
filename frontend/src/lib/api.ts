import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to all outgoing requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sanjeevani_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        // Optional session expired redirect
      }
    }
    return Promise.reject(error);
  }
);

// Typed API services
export const authApi = {
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  refresh: (refresh_token: string) => api.post("/auth/refresh", { refresh_token }),
};

export const nerApi = {
  analyze: (text: string) => api.post("/ner/analyze", { text }),
  getModelInfo: () => api.get("/ner/model-info"),
};

export const documentApi = {
  upload: (formData: FormData) =>
    api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  list: () => api.get("/documents"),
  getById: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const chatApi = {
  sendMessage: (message: string, conversation_id?: string) =>
    api.post("/chat/message", { message, conversation_id }),
  listConversations: () => api.get("/chat/conversations"),
  getConversation: (id: string) => api.get(`/chat/conversations/${id}`),
  deleteConversation: (id: string) => api.delete(`/chat/conversations/${id}`),
};

export const profileApi = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data: any) => api.put("/profile", data),
};

export const historyApi = {
  getHistory: (limit: number = 50) => api.get(`/history?limit=${limit}`),
};

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getAuditLogs: (limit: number = 100) => api.get(`/admin/audit-logs?limit=${limit}`),
};

export const healthApi = {
  getHealth: () => api.get("/health"),
  getReady: () => api.get("/ready"),
};
