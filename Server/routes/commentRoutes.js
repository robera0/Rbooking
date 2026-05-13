import express from "express";
import {
  get_comments,
  post_comments,
} from "../controllers/commentController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";

const commentRouter = express.Router();
// getting the event id
commentRouter.get("/events/:eventId/comments", get_comments); //fix the get path in the front end
commentRouter.post(
  "/events/:eventId/comments",
  authenticateTokenMiddleware,
  post_comments,
);

export default commentRouter;
