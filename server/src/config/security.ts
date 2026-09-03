import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { Express } from "express";
import { env } from "./env.js";

const PROD = env.NODE_ENV === "production";

const RATE_LIMIT_BODY = (message: string) => ({
  error: { code: "RATE_LIMITED", message, status: 429 },
});

/**
 * Central security layer: helmet headers (strict CSP in production),
 * environment-aware CORS, and rate limits on the API and auth surface.
 * Dev/test relax CSP so Vite HMR and inline styles work.
 */
export function applySecurity(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: PROD
        ? {
            useDefaults: true,
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
              fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
              imgSrc: ["'self'", "data:", "blob:"],
              connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
              workerSrc: ["'self'", "blob:"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      crossOriginResourcePolicy: { policy: PROD ? "same-site" : "cross-origin" },
      hsts: PROD ? { maxAge: 31_536_000, includeSubDomains: true } : false,
      referrerPolicy: { policy: "no-referrer" },
      xContentTypeOptions: true,
      xFrameOptions: { action: "deny" },
    })
  );

  app.use(
    cors({
      origin: PROD
        ? process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
          : false
        : true,
      credentials: false,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    })
  );

  if (env.NODE_ENV !== "test") {
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: RATE_LIMIT_BODY("Too many requests; slow down"),
      })
    );
    app.use(
      "/api/v1/auth/login",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: RATE_LIMIT_BODY("Too many login attempts; try again later"),
      })
    );
    app.use(
      "/api/v1/auth/register",
      rateLimit({
        windowMs: 60 * 60 * 1000,
        limit: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: RATE_LIMIT_BODY("Registration limit reached; try again later"),
      })
    );
    app.use(
      "/api/v1/premium/autopilot",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: RATE_LIMIT_BODY("Autopilot analysis limit reached; try again shortly"),
      })
    );
    app.use(
      "/api/v1/dojo/critique",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: RATE_LIMIT_BODY("Dojo critique limit reached; try again shortly"),
      })
    );
    app.use(
      "/api/v1/freelance/generate",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: RATE_LIMIT_BODY("Freelance profile limit reached; try again shortly"),
      })
    );
  }
}
