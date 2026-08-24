import express from "express";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import {
  getProfile,
  updateUser,
  upload,
} from "../controllers/profile.controller.js";

const userProfilesRouter = express.Router();

userProfilesRouter.get("/profile", authenticateTokenMiddleware, getProfile);
userProfilesRouter.put(
  "/profile",
  authenticateTokenMiddleware,
  upload.fields([
    { name: "avatarUrl", maxCount: 1 },
    { name: "coverPage", maxCount: 1 },
  ]),
  updateUser,
);

export default userProfilesRouter;
