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
import passport from "../config/googleAuth.js";
const authrouter = express.Router();
// Google OAuth
authrouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

import { generateAccessToken, generateRefreshToken } from "../service/token.js";

authrouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    // Issue JWT and set cookie, then redirect to frontend with token
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(
          (process.env.CLIENT_URL || "http://localhost:5173") +
            "/login?error=NoUser",
        );
      }
      const payload = {
        id: user._id,
        email: user.email,
      };
      const access_token = generateAccessToken(payload);
      const refresh_token = generateRefreshToken(payload);
      // Optionally, store refresh token in DB for session management
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push({ token: refresh_token });
      await user.save();
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      // Redirect to frontend with token as query param (optional)
      const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/google-auth?token=${access_token}`;
      res.redirect(redirectUrl);
    } catch (err) {
      res.redirect(
        (process.env.CLIENT_URL || "http://localhost:5173") +
          "/login?error=OAuthFail",
      );
    }
  },
);

authrouter.get("/user", authenticateTokenMiddleware, user);
authrouter.post("/signup", register_users);
authrouter.post("/login", login_user);
authrouter.post("/logout", authenticateTokenMiddleware, logout);
authrouter.post("/tokens", refresh);
authrouter.put("/user", authenticateTokenMiddleware, updateUser);

export default authrouter;
