import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "../lib/queryClient";

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
  hasHydrated: boolean;
  setSession: (token: string, refreshToken: string, user: SessionUser) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

// Zustand's `persist` middleware hydrates from localStorage synchronously
// during store creation, so `onRehydrateStorage`'s callback can fire before
// the `const useAuthStore = create(...)` assignment below has completed.
// Referencing `useAuthStore` from inside it would throw a temporal-dead-zone
// ReferenceError and crash the whole app (this module is imported almost
// everywhere). Capture `set` via closure instead — it's valid immediately.
let markHydrated: (() => void) | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      markHydrated = () => set({ hasHydrated: true });
      return {
        token: null,
        refreshToken: null,
        user: null,
        hasHydrated: false,
        setSession: (token, refreshToken, user) => set({ token, refreshToken, user }),
        setTokens: (token, refreshToken) => set({ token, refreshToken }),
        logout: () => {
          // Clear every other user's cached queries immediately so a second
          // login on the same device can never flash the previous user's data.
          queryClient.clear();
          set({ token: null, refreshToken: null, user: null });
        },
      };
    },
    {
      name: "edu-auth",
      onRehydrateStorage: () => () => {
        markHydrated?.();
      },
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
