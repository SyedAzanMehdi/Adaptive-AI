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
  passport,
  glossary,
  scholarships,
} from "../controllers/studentController.js";

export const studentRoutes = Router();

studentRoutes.use(authenticate, requireRole("student", "admin"));
studentRoutes.get("/me", me);
studentRoutes.get("/matrix", myMatrix);
studentRoutes.get("/submissions", mySubmissions);
studentRoutes.get("/passport", passport);
studentRoutes.get("/glossary", glossary);
studentRoutes.get("/scholarships", scholarships);

studentRoutes.post("/diagnostic/start", requireRole("student"), diagnosticStart);
studentRoutes.post(
  "/diagnostic/answer",
  requireRole("student"),
  validateBody(diagnosticAnswerSchema),
  diagnosticAnswer
);
