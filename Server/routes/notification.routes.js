import express from "express";
import {
  add_notification,
  get_notification,
  read_notification,
  clear_notifications,
} from "../controllers/notification.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const notiRouter = express.Router();

notiRouter.get("/notifications", authenticateTokenMiddleware, get_notification);
notiRouter.post(
  "/notifications/add",
  authenticateTokenMiddleware,
  add_notification,
);

notiRouter.patch(
  "/notifications/read",
  authenticateTokenMiddleware,
  read_notification,
);

notiRouter.delete(
  "/notifications/clear",
  authenticateTokenMiddleware,
  clear_notifications,
);

export default notiRouter;
