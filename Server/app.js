import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/databse.js";
import eventRouter from "./routes/eventRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import notiRouter from "./routes/notificationRouter.js";
import authRouter from "./routes/authRoutes.js";
import userProfilesRouter from "./routes/profileRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import passport from "./config/googleAuth.js";
import session from "express-session";
import rateLimit from "express-rate-limit";

import {
  Event,
  Concert,
  Festival,
  GenericEvent,
} from "./models/EventsModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

//connect the db
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://paysso.netlify.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("trust proxy", 1);

app.use(passport.initialize());

app.use("/api", eventRouter);
app.use("/api", commentRouter);

app.use("/api/auth", userProfilesRouter);
app.use("/api/auth", ticketRouter);
app.use("/api/auth", wishlistRouter);
app.use("/api/auth", notiRouter);
app.use("/api/auth", authRouter);

app.use("/api/admin", adminRouter);

startServer();
