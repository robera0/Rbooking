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
      return response.data; // This contains full details including ref_id
    }
  } catch (error) {
    console.error("Verification failed:", error.response?.data || error.message);
  }
}

app.use("/api", eventrouter);
app.use("/api", commentrouter);

app.use("/api/auth", userProfilesRouter);
app.use("/api/auth", ticketrouter);
app.use("/api/auth", wishlistrouter);
app.use("/api/auth", notirouter);
app.use("/api/auth", authrouter);

app.use("/api/admin", adminRouter);


startServer();
