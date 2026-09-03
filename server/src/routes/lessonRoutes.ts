import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { listLessons, getLesson } from "../controllers/lessonController.js";

export const lessonRoutes = Router();

lessonRoutes.use(authenticate);
lessonRoutes.get("/", listLessons);
lessonRoutes.get("/:conceptId", getLesson);
