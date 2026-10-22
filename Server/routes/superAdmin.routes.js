import express from "express";
import { getEvents, getAdmin } from "../controllers/superAdmin.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const SuperAdminRouter = express.Router();

// Everything here exposes platform-wide data, so only super admins get in.
SuperAdminRouter.use(authenticateTokenMiddleware, requireRole("super_admin"));

SuperAdminRouter.get("/all_events", getEvents);
SuperAdminRouter.get("/all_admins", getAdmin);

export default SuperAdminRouter;
