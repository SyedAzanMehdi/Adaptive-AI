import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "./errors.js";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
        .join("; ");
      return next(new ApiError(400, "VALIDATION_ERROR", message));
    }
    req.body = result.data;
    next();
  };
}
