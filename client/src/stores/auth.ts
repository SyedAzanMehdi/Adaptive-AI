import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  plan?: "free" | "premium";
  profile?: { levelTier: string; learningStyle: string };
  status?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (token: string, refreshToken: string, user: SessionUser) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setSession: (token, refreshToken, user) => set({ token, refreshToken, user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () => set({ token: null, refreshToken: null, user: null }),
    }),
    { name: "edu-auth" }
  )
);
