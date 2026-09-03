import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/errors.js";

// Attaches req.user = { id, role, plan } when a valid access token is present.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, "UNAUTHENTICATED", "Missing bearer token"));
  try {
    const payload = verifyToken(token);
    if (payload.type !== "access") {
      return next(new ApiError(401, "TOKEN_INVALID", "Wrong token type"));
    }
    (req as any).user = { id: payload.sub, role: payload.role, plan: payload.plan ?? "free" };
    next();
  } catch {
    next(new ApiError(401, "TOKEN_INVALID", "Invalid or expired token"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
    if (!roles.includes(user.role)) {
      return next(new ApiError(403, "FORBIDDEN_ROLE", "Insufficient role for this resource"));
    }
    next();
  };
}

// Subscription gating: premium features reject free plans with 402.
export function requirePlan(plan: "premium") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
    if (user.role === "admin" || user.plan === plan) return next();
    next(new ApiError(402, "PREMIUM_REQUIRED", "This feature requires Adaptive+ Premium"));
  };
}
