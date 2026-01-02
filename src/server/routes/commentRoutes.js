import express from "express";
import { get_comments } from "../controllers/commentController.js";

const commentrouter = express.Router();

commentrouter.get("/:id", get_comments);

export default commentrouter;
