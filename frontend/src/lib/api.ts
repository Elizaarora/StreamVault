import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authApi = {
  signup: (data: { username: string; email: string; password: string }) =>
    api.post<TokenResponse>("/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>("/auth/login", data),

  me: () => api.get<AuthUser>("/auth/me"),

  googleLogin: (mode: "signin" | "signup" = "signin") => {
    window.location.href = `${API_BASE}/auth/google?mode=${mode}`;
  },

  setUsername: (username: string) =>
    api.patch<AuthUser>("/auth/username", { username }),

  forgotPassword: (email: string) =>
    api.post<{ message: string; dev_reset_url?: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, new_password }),
};
