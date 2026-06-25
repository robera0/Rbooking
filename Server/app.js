import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/databse.js";
import eventRouter from "./routes/event.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import commentRouter from "./routes/comment.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import notiRouter from "./routes/notification.routes.js";
import authRouter from "./routes/auth.routes.js";
import userProfilesRouter from "./routes/profile.routes.js";
import adminRouter from "./routes/admin.routes.js";
import cookieParser from "cookie-parser";
import passport from "./config/googleAuth.js";
import session from "express-session";
import rateLimit from "express-rate-limit";
import errorHandler from "./errors/errorHandler.js";
import {
  Event,
  Concert,
  Festival,
  GenericEvent,
} from "./models/events.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

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
  windowMs: 150 * 60 * 1000, // 15 minutes
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

app.use("/api/auth/admin", adminRouter);
app.use(errorHandler);
startServer();
