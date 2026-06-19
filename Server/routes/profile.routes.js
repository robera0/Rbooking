import express from "express";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import {
  get_user_profile,
  update_user,
  upload,
} from "../controllers/profile.controller.js";

const userRouter = express.Router();

userRouter.get("/profile", getProfile)
userProfilesRouter.get(
  "/profile",
  authenticateTokenMiddleware,
  get_user_profile
);
userProfilesRouter.put(
  "/user_profile",
  authenticateTokenMiddleware,
  upload.single("avatarUrl"),
  update_user
);

export default userProfilesRouter;
