import express from "express";
import {
  add_notification,
  get_notification,
  read_notification,
} from "../controllers/notificationController.js";
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

export default notiRouter;
