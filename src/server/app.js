import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/databse.js";
import eventrouter from "./routes/eventRoutes.js";
import ticketrouter from "./routes/ticketRoutes.js";
import commentrouter from "./routes/commentRoutes.js";
import wishlistrouter from "./routes/wishlistRoutes.js";
import notirouter from "./routes/notificationRouter.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
//connect the db
connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/", eventrouter);
app.use("/api", ticketrouter);
app.use("/api", commentrouter);
app.use("api", wishlistrouter);
app.use("/api", notirouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
