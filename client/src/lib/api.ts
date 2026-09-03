import axios from "axios";
import { useAuthStore } from "../stores/auth";

export const API_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config ?? {};
    if (error.response?.status === 401 && !original._retried) {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (refreshToken && !original.url?.includes("/auth/")) {
        original._retried = true;
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          setTokens(res.data.token, res.data.refreshToken);
          original.headers = { ...original.headers, Authorization: `Bearer ${res.data.token}` };
          return api(original);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error?.message ?? err.message;
  }
  return String(err);
}

export default api;
