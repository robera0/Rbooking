import mongoose from "mongoose";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();
const REDIS_URL = process.env.REDIS_URL;

const redisClient = createClient({
  url: REDIS_URL,
});
console.log("REDIS_URL:", REDIS_URL);
redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

export default redisClient;

export const clearEventsCache = async () => {
  try {
    // Scan and delete all matching list cache keys
    const keys = await redisClient.keys("events:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Failed to clear event cache :", err);
  }
};

export const clearSingleEventCache = async (eventId) => {
  try {
    if (!eventId) return;

    await redisClient.del(`event:single:${eventId}`);
  } catch (err) {
    console.error(`Failed to clear single event cache for ID ${eventId}:`, err);
  }
};

export const clearWishListCache = async (userId) => {
  try {
    if (!userId) return;

    const cacheKey = `wishlist:${userId}`;
    await redisClient.del(cacheKey);
  } catch (err) {
    console.error("Failed to clear wishlist cache:", err);
  }
};
