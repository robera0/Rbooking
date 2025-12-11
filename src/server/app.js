import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import eventrouter from "./event.js";
import profilerouter from "./profile.js";
import userRouter from "./user.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO;

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  No cache for dynamic APIs
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Apply API routes (now no-store works)
app.use("/api", eventrouter);
app.use("/api", profilerouter);
app.use("/api", userRouter);

// Strong cache for static assets
app.use(
  express.static(path.join(__dirname, "dist"), {
    maxAge: "1y",
    immutable: true,
  })
);

//  No-cache for index.html (React main entry)
app.get(/.*/, (req, res) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
