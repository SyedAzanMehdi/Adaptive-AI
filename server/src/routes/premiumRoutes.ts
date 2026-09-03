import { Router } from "express";
import { authenticate, requireRole, requirePlan } from "../middleware/authMiddleware.js";
import {
  upgrade,
  validateUpgrade,
  planInfo,
  memory,
  rescueStart,
  rescueAnswer,
  validateRescueAnswer,
  dna,
  createAutopilot,
  getAutopilot,
  validateAutopilot,
} from "../controllers/premiumController.js";

export const premiumRoutes = Router();

premiumRoutes.use(authenticate);
premiumRoutes.get("/plan", planInfo);
premiumRoutes.post("/upgrade", requireRole("student"), validateUpgrade, upgrade);

// Memory Twin™ — premium features
premiumRoutes.get("/memory", requirePlan("premium"), memory);
premiumRoutes.post("/memory/rescue", requirePlan("premium"), rescueStart);
premiumRoutes.post("/memory/rescue/answer", requirePlan("premium"), validateRescueAnswer, rescueAnswer);

// Struggle DNA™ — full report premium, teaser free
premiumRoutes.get("/dna", dna);

// Career Autopilot™ — JD gap analysis + 90-day plan
premiumRoutes.post("/autopilot", requirePlan("premium"), validateAutopilot, createAutopilot);
premiumRoutes.get("/autopilot", requirePlan("premium"), getAutopilot);
