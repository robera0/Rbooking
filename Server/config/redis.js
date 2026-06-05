import mongoose from "mongoose";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();
const REDIS_URL = process.env.REDIS_URL;

const redisClient = new Redis(REDIS_URL);
console.log("REDIS_URL:", REDIS_URL);
redisClient.on("connect", () =>
  console.log("Redis Connected Successfully  via ioredis"),
);
redisClient.on("error", (err) => console.error("Redis Client Error", err));
export default redisClient;
export const clearEventsCache = async () => {
  try {
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

    const cacheKey = `user:wishlist:${userId}`;
    await redisClient.unlink(cacheKey);
  } catch (err) {
    console.error("Failed to clear wishlist cache:", err);
  }
};

export const clearTicketCache = async () => {
  try {
    const keys = await redisClient.keys("user:ticket:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Failed to clear ticket cache:", err);
  }
};
