import express from "express";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import {
  get_user_profile,
  update_user,
  upload,
} from "../controllers/userProfileController.js";

const userProfilesRouter = express.Router();

userProfilesRouter.get(
  "/user_profile",
  authenticateTokenMiddleware,
  get_user_profile,
);
userProfilesRouter.put(
  "/user_profile",
  authenticateTokenMiddleware,
  upload,
  update_user,
);
export default userProfilesRouter;
