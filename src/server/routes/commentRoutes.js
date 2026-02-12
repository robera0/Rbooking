import express from "express";
import {
  get_comments,
  post_comments,
} from "../controllers/commentController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";

const commentrouter = express.Router();
// getting the event id
commentrouter.get("/events/:id", get_comments);
commentrouter.post(
  "/auth/comments/:id",
  authenticateTokenMiddleware,
  post_comments,
);

export default commentrouter;
