import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { validateBody } from "../utils/validate.js";
import { freelanceRequestSchema } from "@edu/shared";
import { generate, latest } from "../controllers/freelanceController.js";

export const freelanceRoutes = Router();

freelanceRoutes.use(authenticate, requireRole("student", "admin"));
freelanceRoutes.get("/latest", latest);
freelanceRoutes.post("/generate", requireRole("student"), validateBody(freelanceRequestSchema), generate);
