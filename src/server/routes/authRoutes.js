import express from "express";
import {
  register_users,
  login_user,
  refresh,
} from "../controllers/authController.js";
import { user } from "../controllers/userController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
const authrouter = express.Router();

authrouter.post("/signup", register_users);
authrouter.post("/login", login_user);
authrouter.get("/user", authenticateTokenMiddleware, user);
authrouter.post("/tokens", refresh);

export default authrouter;
