import { Router } from "express";
import { registerSchema, loginSchema } from "@edu/shared";
import { register, login, refresh } from "../controllers/authController.js";
import { validateBody } from "../utils/validate.js";

export const authRoutes = Router();

authRoutes.post("/register", validateBody(registerSchema), register);
authRoutes.post("/login", validateBody(loginSchema), login);
authRoutes.post("/refresh", refresh);
