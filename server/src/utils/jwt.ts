import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "@edu/shared";

const ISSUER = "adaptive-learning-platform";

export interface TokenPayload {
  sub: string;
  role: Role;
  plan: "free" | "premium";
  type: "access" | "refresh";
}

export function signAccessToken(userId: string, role: Role, plan: "free" | "premium" = "free"): string {
  return jwt.sign({ sub: userId, role, plan, type: "access" }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: ISSUER,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, role: Role, plan: "free" | "premium" = "free"): string {
  return jwt.sign({ sub: userId, role, plan, type: "refresh" }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: ISSUER,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET, { issuer: ISSUER }) as TokenPayload;
}
