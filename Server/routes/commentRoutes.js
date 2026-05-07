import express from "express";
import {
  get_comments,
  post_comments,
} from "../controllers/commentController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";

const commentRouter = express.Router();
// getting the event id
commentRouter.get("/events/:id", get_comments);
commentRouter.post(
  "/auth/comments/:id",
  authenticateTokenMiddleware,
  post_comments,
);

export default commentRouter;
