import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URL = process.env.MONGO;
console.log("MONGO_URI:", MONGO_URL);
const connectDB = async () => {
  try {
    await mongoose.connect(`${MONGO_URL}`);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
