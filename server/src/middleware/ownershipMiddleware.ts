import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors.js";

// Object-level authorization: the resource owner must match the authenticated
// user unless the caller is an admin.
export function requireOwnership(getOwnerId: (req: Request) => string | undefined) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const ownerId = getOwnerId(req);
    if (!user) return next(new ApiError(401, "UNAUTHENTICATED", "Authentication required"));
    if (user.role === "admin") return next();
    if (ownerId !== user.id) {
      return next(new ApiError(403, "FORBIDDEN_OWNER", "You do not own this resource"));
    }
    next();
  };
}
