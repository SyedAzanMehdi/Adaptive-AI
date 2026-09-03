import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import {
  listChallenges,
  critique,
  history,
  validateDojoCritique,
} from "../controllers/dojoController.js";

export const dojoRoutes = Router();

dojoRoutes.use(authenticate, requireRole("student", "admin"));
dojoRoutes.get("/challenges", listChallenges);
dojoRoutes.post("/critique", requireRole("student"), validateDojoCritique, critique);
dojoRoutes.get("/history", history);
