import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/databse.js";
import eventrouter from "./routes/eventRoutes.js";
import ticketrouter from "./routes/ticketRoutes.js";
import commentrouter from "./routes/commentRoutes.js";
import wishlistrouter from "./routes/wishlistRoutes.js";
import notirouter from "./routes/notificationRouter.js";
import authrouter from "./routes/authRoutes.js";
import userProfilesRouter from "./routes/profileRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import passport from "./config/googleAuth.js";
import session from "express-session";
import {
  Event,
  Concert,
  Festival,
  GenericEvent,
} from "./models/EventsModel.js";
// Importing these ensures .discriminator() is called and registered
dotenv.config();

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

app.use(express.json());

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
    cookie: { secure: false },
  }),
);

// passport.session() removed — app uses JWTs (session: false on OAuth callback)
app.use(passport.initialize());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", eventrouter);
app.use("/api", commentrouter);

app.use("/api/auth", userProfilesRouter);
app.use("/api/auth", ticketrouter);
app.use("/api/auth", wishlistrouter);
app.use("/api/auth", notirouter);
app.use("/api/auth", authrouter);

app.use("/api/admin", adminRouter);
startServer();
