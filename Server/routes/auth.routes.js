import express from "express";
import {
  login,
  refresh,
  logout,
  registerAdmin,
  register,
} from "../controllers/auth.controller.js";

import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import {
  updateUser,
  completeProfile,
  user,
} from "../controllers/user.controller.js";
import passport from "../config/googleAuth.js";
import { generateAccessToken, generateRefreshToken } from "../service/token.js";
import { UserModel } from "../models/user.model.js";
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
    console.log(" Google callback hit!");
    console.log("user:", req.user);
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
      const MAX_REFRESH_TOKENS = 5;
      await UserModel.findByIdAndUpdate(user._id, {
        $push: {
          refreshTokens: {
            $each: [{ token: refresh_token, createdAt: new Date() }],
            $slice: -MAX_REFRESH_TOKENS, // keeps only the most recent N entries
          },
        },
      });

      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      });
      // Redirect to frontend with token as query param (optional)
      const isNewUser = user.isNewUser || !user.isProfileComplete;

      const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/google-auth?isNewUser=${isNewUser}`;
      res.redirect(redirectUrl);
    } catch (err) {
      console.error("❌ OAuth error:", err);
      res.redirect(
        (process.env.CLIENT_URL || "http://localhost:5173") +
          "/login?error=OAuthFail",
      );
    }
  },
);
authRouter.get("/user", authenticateTokenMiddleware, user);
authRouter.post("/signup/user", register);
authRouter.post("/admin/signup", registerAdmin);
//authRouter.post("/signup/admin", register_admin);
authRouter.post("/login", login);
authRouter.post("/logout", authenticateTokenMiddleware, logout);
authRouter.post("/tokens", refresh);

authRouter.use(authenticateTokenMiddleware);
authRouter.route("/user").get(user).put(updateUser);
authRouter.route("/complete-profile").put(completeProfile);

export default authRouter;
