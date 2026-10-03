import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import {
  create,
  list,
  remove,
  update,
  validateApplication,
  validateApplicationUpdate,
} from "../controllers/applicationController.js";

export const applicationRoutes = Router();

// No AI and no plan gate: the tracker is useful to every student, and gating it
// would hide the pipeline stats that make the Autopilot ETA credible.
applicationRoutes.use(authenticate, requireRole("student"));
applicationRoutes.get("/", list);
applicationRoutes.post("/", validateApplication, create);
applicationRoutes.patch("/:id", validateApplicationUpdate, update);
applicationRoutes.delete("/:id", remove);
