import express from "express";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { getAdminSettings, updateAdminSettings } from "../controllers/adminSettings.controller.js";

const router = express.Router();

router.use(authenticateTokenMiddleware);

router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

export default router;
