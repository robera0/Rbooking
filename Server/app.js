import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

app.get('/api/chapa-webhook', async (req, res) => {
  const { trx_ref, status } = req.query;
  console.log("Webhook endpoint was hit!");
  console.log("trx_ref: ", trx_ref)
  console.log("status: ", status)
  try {
    const data = await verifyChapaPayment(trx_ref);

    if (data.status === "success" && data.data.status === "success") {
      await TransactionService.updateStatusByTxRef(trx_ref, "completed");
    }
  } catch (error) {
    console.error("Error: ", error);
  }
  // 4. ALWAYS return a 200 OK to Chapa so they know you got it
  return res.status(200).send('Webhook received successfully');
});

async function verifyChapaPayment(trx_ref) {
  try {
    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${trx_ref}`, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    if (response.data.status === "success") {
      console.log("Payment Verified Successfully!");
      return response.data; //
    }
  } catch (error) {
    console.error("Verification failed:", error.response?.data || error.message);
  }
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", eventRouter);
app.use("/api", commentRouter);

app.use("/api/auth", userProfilesRouter);
app.use("/api/auth", ticketRouter);
app.use("/api/auth", wishlistRouter);
app.use("/api/auth", notiRouter);
app.use("/api/auth", authRouter);

app.use("/api/admin", adminRouter);


startServer();
