import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/databse.js";
import authRouter from "./routes/profile.routes.js";
import { generateAccessToken } from "./service/token.js";

const app = express();
app.use(express.json());

// Mock user for token
const payload = {
  id: new mongoose.Types.ObjectId().toString(),
  email: "test@example.com",
  role: "user"
};
const token = generateAccessToken(payload);

app.use((req, res, next) => {
  req.headers.authorization = `Bearer ${token}`;
  next();
});

app.use("/api/auth", authRouter);

async function run() {
  await connectDB();
  
  const res = await request(app)
    .put("/api/auth/profile")
    .field("fullName", "Robi test")
    .field("Gender", "male")
    .field("phone", "");
    
  console.log("Status:", res.status);
  console.log("Body:", res.body);
  process.exit(0);
}

run();
