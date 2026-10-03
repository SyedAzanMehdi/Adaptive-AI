import { Router } from "express";
import { z } from "zod";
import { passwordSchema } from "@edu/shared";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { validateBody } from "../utils/validate.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listSoftwareHouses,
  updateSoftwareHouse,
  deleteSoftwareHouse,
  getCurriculum,
  updateCurriculum,
  analytics,
  auditLog,
} from "../controllers/adminController.js";

export const adminRoutes = Router();

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(["student", "admin"]).default("student"),
});

const updateUserSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  role: z.enum(["student", "admin"]).optional(),
  plan: z.enum(["free", "premium"]).optional(),
  profile: z
    .object({
      levelTier: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      learningStyle: z.enum(["analogical", "diagrammatic", "conceptual"]).optional(),
    })
    .optional(),
});

adminRoutes.use(authenticate, requireRole("admin"));
adminRoutes.get("/users", listUsers);
adminRoutes.post("/users", validateBody(createUserSchema), createUser);
adminRoutes.patch("/users/:id", validateBody(updateUserSchema), updateUser);
adminRoutes.delete("/users/:id", deleteUser);
adminRoutes.get("/software-houses", listSoftwareHouses);
adminRoutes.patch("/software-houses/:id", updateSoftwareHouse);
adminRoutes.delete("/software-houses/:id", deleteSoftwareHouse);
adminRoutes.get("/curriculum", getCurriculum);
adminRoutes.patch("/curriculum", updateCurriculum);
adminRoutes.get("/analytics", analytics);
adminRoutes.get("/audit-log", auditLog);
