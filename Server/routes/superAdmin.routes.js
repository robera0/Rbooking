import express from "express";
import { getEvents, getAdmin } from "../controllers/superAdmin.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";

const SuperAdminRouter = express.Router();

SuperAdminRouter.get("/all_events", authenticateTokenMiddleware, getEvents);
SuperAdminRouter.get("/all_admins", authenticateTokenMiddleware, getAdmin);

export default SuperAdminRouter;
