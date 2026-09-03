import { Router } from "express";
import { submitCodeSchema } from "@edu/shared";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { validateBody } from "../utils/validate.js";
import { submitCode, getFeedback, listExercises } from "../controllers/submissionController.js";

export const submissionRoutes = Router();

submissionRoutes.use(authenticate);
submissionRoutes.get("/exercises", listExercises);
submissionRoutes.get("/:id/feedback", getFeedback);
submissionRoutes.post("/", requireRole("student"), validateBody(submitCodeSchema), submitCode);
