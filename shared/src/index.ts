export * from "./schemas.js";

// Shared plain-TS DTO types used by both client and server.
export interface ApiError {
  error: { code: string; message: string; status: number };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
