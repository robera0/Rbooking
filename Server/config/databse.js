import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URL = process.env.NEW_MONGO || process.env.LOCAL_MONGO;
console.log("MONGO_URI:", MONGO_URL);

const connectDB = async () => {
  try {
    await mongoose.connect(`${MONGO_URL}`);
    console.log("DB NAME:", mongoose.connection.name);
    console.log("DB HOST:", mongoose.connection.host);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
