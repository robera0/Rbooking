import express from "express";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { get_user_profile } from "../controllers/user_profileController.js";
const userProfilesRouter = express.Router();

userProfilesRouter.get(
  "/user_profile",
  authenticateTokenMiddleware,
  get_user_profile
);
