import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export function RequireAuth({ children, role }: { children: ReactNode; role?: string }) {
  const { user, token, hasHydrated } = useAuthStore();
  // The persisted session loads from localStorage asynchronously; render
  // nothing until that finishes so an already-logged-in user never
  // flash-redirects to /login on a hard refresh.
  if (!hasHydrated) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
}
