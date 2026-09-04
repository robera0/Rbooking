import "dotenv/config";
import mongoose from "mongoose";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Key prefix to avoid collisions with other apps (e.g. Payso Bingo) sharing the same Redis URL
export const REDIS_PREFIX = "paysso:";

const redisClient = new Redis(REDIS_URL);
console.log("REDIS_URL:", REDIS_URL);
redisClient.on("connect", () =>
  console.log("Redis Connected Successfully  via ioredis"),
);
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("reconnect", () => console.log("Redis Reconnected"));
export default redisClient;

export const clearEventsCache = async () => {
  try {
    const keys = await redisClient.keys(`${REDIS_PREFIX}events:*`);

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

    // We must clear ALL keys starting with the eventId to clear both 
    // event:single:ID and event:single:ID:ticketID caches
    const pattern = `${REDIS_PREFIX}event:single:${eventId}*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error(`Failed to clear single event cache for ID ${eventId}:`, err);
  }
};

export const clearWishListCache = async (userId) => {
  try {
    if (!userId) return;

    const cacheKey = `${REDIS_PREFIX}user:wishlist:${userId}`;
    await redisClient.unlink(cacheKey);
  } catch (err) {
    console.error("Failed to clear wishlist cache:", err);
  }
};

export const clearTicketCache = async (userId) => {
  try {
    if (!userId) return;
    await redisClient.del(`${REDIS_PREFIX}user:ticket:list:${userId}`);
  } catch (err) {
    console.error("Failed to clear ticket cache:", err);
  }
};

export const clearTicketInfoCache = async (ticketId) => {
  try {
    if (!ticketId) return;
    await redisClient.del(`${REDIS_PREFIX}user:ticket:info:${ticketId}`);
  } catch (err) {
    console.error("Failed to clear ticket info cache:", err);
  }
};
