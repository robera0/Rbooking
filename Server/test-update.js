import mongoose from "mongoose";
import connectDB from "./config/databse.js";
import { ProfileModel } from "./models/profile.model.js";

async function run() {
  await connectDB();
  const userId = new mongoose.Types.ObjectId();
  
  try {
    const updates = { fullName: "Test User", Gender: "male" };
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId: userId },
      updates,
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );
    console.log("Success:", updatedProfile);
  } catch (error) {
    console.log("Error message:", error.message);
  }
  process.exit(0);
}

run();
