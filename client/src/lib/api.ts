import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Same-origin by default: the Vite dev proxy and the Vercel rewrite both serve
// the API under /api, so a relative base works in dev AND production. An
// absolute localhost fallback would make the deployed SPA call the visitor's
// own machine. Override VITE_API_URL only for a split-origin deploy.
export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Shared across concurrent 401s so a burst of simultaneous requests (e.g. a
// dashboard firing several queries at once) triggers exactly one refresh
// call instead of each racing to overwrite the other's new tokens.
let refreshInFlight: Promise<{ token: string; refreshToken: string }> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config ?? {};
    if (error.response?.status === 401 && !original._retried) {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (refreshToken && !original.url?.includes("/auth/")) {
        original._retried = true;
        try {
          if (!refreshInFlight) {
            refreshInFlight = axios
              .post(`${API_URL}/auth/refresh`, { refreshToken })
              .then((res) => ({ token: res.data.token, refreshToken: res.data.refreshToken }))
              .finally(() => {
                refreshInFlight = null;
              });
          }
          const tokens = await refreshInFlight;
          setTokens(tokens.token, tokens.refreshToken);
          original.headers = { ...original.headers, Authorization: `Bearer ${tokens.token}` };
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
