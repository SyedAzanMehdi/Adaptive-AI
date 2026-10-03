import { Router } from "express";
import { diagnosticAnswerSchema } from "@edu/shared";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { validateBody } from "../utils/validate.js";
import {
  me,
  myMatrix,
  diagnosticStart,
  diagnosticAnswer,
  mySubmissions,
  resilience,
  fieldRecommendation,
} from "../controllers/studentController.js";

export const studentRoutes = Router();

studentRoutes.use(authenticate, requireRole("student", "admin"));
studentRoutes.get("/me", me);
studentRoutes.get("/matrix", myMatrix);
studentRoutes.get("/submissions", mySubmissions);
studentRoutes.get("/resilience", resilience);
studentRoutes.get("/field-recommendation", fieldRecommendation);

studentRoutes.post("/diagnostic/start", requireRole("student"), diagnosticStart);
studentRoutes.post(
  "/diagnostic/answer",
  requireRole("student"),
  validateBody(diagnosticAnswerSchema),
  diagnosticAnswer
);
