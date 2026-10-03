import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { list } from "../controllers/softwareHouseController.js";

export const softwareHouseRoutes = Router();

// Read-only directory for students — adding/editing/removing entries is
// admin-only (see adminRoutes.ts).
softwareHouseRoutes.use(authenticate, requireRole("student", "admin"));
softwareHouseRoutes.get("/", list);
