import express from "express";
import {
  get_comments,
  post_comments,
  update_comment,
} from "../controllers/comment.controller.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";

const commentRouter = express.Router();
// getting the event id
commentRouter.get("/events/:eventId/comments", get_comments);
commentRouter.patch(
  "/comments/:commentId/like",
  authenticateTokenMiddleware,
  update_comment,
);
commentRouter.post(
  "/auth/events/:eventId/comments",
  authenticateTokenMiddleware,
  post_comments,
);

export default commentRouter;
