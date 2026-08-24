import mongoose from "mongoose";
import "dotenv/config";
import { ProfileModel } from "./Server/models/profile.model.js";

async function run() {
  await mongoose.connect(process.env.MONGO);
  console.log("Connected to MongoDB");
  
  const profile = await ProfileModel.findOne({ userId: "6a8c4846dabb7c0bc5e44eba" });
  console.log("Profile:", profile);
  
  process.exit(0);
}
run();
