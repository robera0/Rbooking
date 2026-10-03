import express from "express";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { getAdminSettings, updateAdminSettings } from "../controllers/adminSettings.controller.js";

const router = express.Router();

router.use(authenticateTokenMiddleware, requireAdmin);

router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

export default router;
