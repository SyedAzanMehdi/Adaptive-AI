import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import {
  createScript,
  getSession,
  history,
  submitScorecard,
  validateInterviewScorecard,
  validateInterviewScript,
} from "../controllers/interviewController.js";

export const interviewRoutes = Router();

// Free for every student, like the Dojo and Freelance Launchpad: the script
// falls back to the curated bank when there is no Autopilot gap report.
interviewRoutes.use(authenticate, requireRole("student", "admin"));
interviewRoutes.post("/script", requireRole("student"), validateInterviewScript, createScript);
interviewRoutes.post("/scorecard", requireRole("student"), validateInterviewScorecard, submitScorecard);
interviewRoutes.get("/history", history);
interviewRoutes.get("/session/:sessionId", getSession);
