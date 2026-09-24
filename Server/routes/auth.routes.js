import express from "express";
import {
  login,
  refresh,
  logout,
  registerAdmin,
  register,
  googleExchange,
} from "../controllers/auth.controller.js";

import { authenticateTokenMiddleware } from "../middlewares/authenticateToken.js";
import {
  updateUser,
  completeProfile,
  user,
} from "../controllers/user.controller.js";
import { upload } from "../controllers/events.controller.js";
import passport from "../config/googleAuth.js";
import { nanoid } from "nanoid";
import redisClient, { REDIS_PREFIX } from "../config/redis.js";
const authRouter = express.Router();
// Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
    prompt: "select_account consent",
  }),
  async (req, res) => {
    console.log(" Google callback hit!");
    console.log("user:", req.user);
    // The browser is still on the backend's own domain (onrender.com) at
    // this point, while the app itself lives on a different domain
    // (netlify.app). Setting the session cookie here would bind it to the
    // wrong domain, so instead we hand the frontend a short-lived one-time
    // code; the frontend exchanges it through its own same-origin /api
    // proxy (see /google/exchange below), which is what actually sets the
    // cookie on the right domain.
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(
          (process.env.CLIENT_URL || "http://localhost:5173") +
            "/login?error=NoUser",
        );
      }

      const exchangeCode = nanoid(32);
      await redisClient.set(
        `${REDIS_PREFIX}oauth_exchange:${exchangeCode}`,
        JSON.stringify({ id: user._id, email: user.email, role: user.role }),
        "EX",
        120,
      );

      const isNewUser = user.isNewUser || !user.isProfileComplete;

      const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/google-auth?isNewUser=${isNewUser}&code=${exchangeCode}`;
      res.redirect(redirectUrl);
    } catch (err) {
      console.error("OAuth error:", err);
      res.redirect(
        (process.env.CLIENT_URL || "http://localhost:5173") +
          "/login?error=OAuthFail",
      );
    }
  },
);
authRouter.get("/user", authenticateTokenMiddleware, user);
authRouter.post("/signup/user", register);
authRouter.post("/signup/admin", upload.single("coverPage"), registerAdmin);
//authRouter.post("/signup/admin", register_admin);
authRouter.post("/login", login);
authRouter.post("/google/exchange", googleExchange);
authRouter.post("/logout", authenticateTokenMiddleware, logout);
authRouter.post("/tokens", refresh);

authRouter.use(authenticateTokenMiddleware);
authRouter.route("/user").get(user).put(updateUser);
authRouter.route("/complete-profile").put(completeProfile);

export default authRouter;
