import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URL = process.env.MONGO;
const connectDB = async () => {
  try {
    await mongoose.connect(`${MONGO_URL}`).then(() => {
      console.log("MongoDB connected");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
