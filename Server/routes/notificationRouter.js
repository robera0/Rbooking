import express from "express";
import { getNotifications } from "../controllers/notificationController.js";
import { authenticateTokenMiddleware } from "Server/middlewares/authenticateToken.js";


const notificationRouter = express.Router();

notificationRouter.use(authenticateTokenMiddleware);

notificationRouter.get("/", getNotifications);

export default notificationRouter;
