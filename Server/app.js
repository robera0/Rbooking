import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/databse.js";
import eventrouter from "./routes/eventRoutes.js";
import ticketrouter from "./routes/ticketRoutes.js";
import commentrouter from "./routes/commentRoutes.js";
import wishlistrouter from "./routes/wishlistRoutes.js";
import notificationRouter from "./routes/notificationRouter.js";
import authrouter from "./routes/authRoutes.js";
import userProfilesRouter from "./routes/profileRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import passport from "./config/googleAuth.js";
import session from "express-session";

dotenv.config();
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

app.use(express.json());

// CORS must come first so preflight OPTIONS requests are handled before auth middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://paysso.netlify.app"],
    credentials: true,
  }),
);
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  }),
);
// passport.session() removed — app uses JWTs (session: false on OAuth callback)
app.use(passport.initialize());

app.use("/api", eventrouter);
app.use("/api", commentrouter);

app.use("/api/auth", userProfilesRouter);
app.use("/api/auth", ticketrouter);
app.use("/api/auth", wishlistrouter);
app.use("api/notifications", notificationRouter)
app.use("/api/auth", authrouter);

app.use("/api/admin", adminRouter);
startServer();
