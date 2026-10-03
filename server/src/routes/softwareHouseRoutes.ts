import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware.js";
import { list, mine, create, validateSoftwareHouse } from "../controllers/softwareHouseController.js";

export const softwareHouseRoutes = Router();

softwareHouseRoutes.use(authenticate, requireRole("student", "admin"));
softwareHouseRoutes.get("/", list);
softwareHouseRoutes.get("/mine", mine);
softwareHouseRoutes.post("/", validateSoftwareHouse, create);
