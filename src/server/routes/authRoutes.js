import express from "express";
import {
  register_users,
  login_user,
  refresh,
  logout,
} from "../controllers/authController.js";
import { user } from "../controllers/userController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { updateUser } from "../controllers/userController.js";
const authrouter = express.Router();

authrouter.get("/user", authenticateTokenMiddleware, user);
authrouter.post("/signup", register_users);
authrouter.post("/login", login_user);
authrouter.post("/logout", authenticateTokenMiddleware, logout);
authrouter.post("/tokens", refresh);
authrouter.put("/user", authenticateTokenMiddleware, updateUser);

export default authrouter;
