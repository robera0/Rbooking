import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/databse.js";
import eventrouter from "./routes/eventRoutes.js";
import ticketrouter from "./routes/ticketRoutes.js";
import commentrouter from "./routes/commentRoutes.js";
import wishlistrouter from "./routes/wishlistRoutes.js";
import notirouter from "./routes/notificationRouter.js";
import authrouter from "./routes/authRoutes.js";
import userProfilesRouter from "./routes/profileRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
//connect the db
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: "https://paysso.netlify.app/",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api", eventrouter);
app.use("/api", commentrouter);

app.use("/api/auth", userProfilesRouter);
app.use("/api/auth", ticketrouter);
app.use("/api/auth", wishlistrouter);
app.use("/api/auth", notirouter);
app.use("/api/auth", authrouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
