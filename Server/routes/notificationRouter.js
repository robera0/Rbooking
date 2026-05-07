import express from "express";
import { get_notification } from "../controllers/notificationController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const notiRouter = express.Router();

notiRouter.get("/notifications", authenticateTokenMiddleware, get_notification);

export default notiRouter;
