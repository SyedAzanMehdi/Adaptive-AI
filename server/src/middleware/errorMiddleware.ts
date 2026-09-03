import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors.js";

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found`, status: 404 },
  });
}

type BodyParserError = { type?: string; status?: number; statusCode?: number };

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, status: err.status },
    });
  }

  // Malformed JSON bodies must yield a clean 400, not a 500.
  const bp = err as BodyParserError;
  if (bp?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON", status: 400 },
    });
  }
  if (bp?.type === "entity.too.large") {
    const status = bp.status ?? bp.statusCode ?? 413;
    return res.status(status).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds the size limit", status },
    });
  }

  console.error("[error]", err);
  res.status(500).json({
    error: { code: "INTERNAL", message: "Internal server error", status: 500 },
  });
}
