import express from "express";
import {
  register_admin,
  login_user,
  refresh,
  logout,
  register_user,
} from "../controllers/authController.js";
import { user } from "../controllers/userController.js";
import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import { updateUser } from "../controllers/userController.js";
import passport from "../config/googleAuth.js";
import { generateAccessToken, generateRefreshToken } from "../service/token.js";

import { Router } from "express";
const authRouter = express.Router();
// Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
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

authRouter.get("/user", authenticateTokenMiddleware, user);
authRouter.post("/signup/user", register_user);
authRouter.post("/signup/admin", register_admin);
authRouter.post("/login", login_user);
authRouter.post("/logout", authenticateTokenMiddleware, logout);
authRouter.post("/tokens", refresh);
authRouter.put("/user", authenticateTokenMiddleware, updateUser);

export default authRouter;
