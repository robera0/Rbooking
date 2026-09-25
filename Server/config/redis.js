import "dotenv/config";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Key prefix to avoid collisions with other apps sharing the same Redis URL
export const REDIS_PREFIX = "paysso:";

// ---------- Create the real client (only if a valid URL is set) ----------
let realClient = null;

if (REDIS_URL) {
  try {
    realClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      commandTimeout: 2000,
      enableOfflineQueue: false, // fail fast when not connected
      retryStrategy: (times) => Math.min(times * 2000, 30000), // slow, capped reconnects
    });

    let errorLogged = false;
    realClient.on("connect", () => {
      errorLogged = false;
      console.log("Redis connected via ioredis");
    });
    realClient.on("error", (err) => {
      // log once per outage instead of once per retry
      if (!errorLogged) {
        console.error("Redis unavailable, running without cache:", err.message);
        errorLogged = true;
      }
    });
  } catch (err) {
    console.error("Invalid REDIS_URL, running without cache:", err.message);
    realClient = null;
  }
} else {
  console.log("REDIS_URL not set, running without cache");
}

const isReady = () => realClient && realClient.status === "ready";

// A pipeline that does nothing (used when Redis is down)
const noopPipeline = () => {
  const p = {
    set: () => p,
    setex: () => p,
    expire: () => p,
    del: () => p,
    unlink: () => p,
    exec: async () => [],
  };
  return p;
};

// Runs a Redis call; returns fallback if Redis is down or the call fails
const guard = async (fn, fallback = null) => {
  if (!isReady()) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

// ---------- Safe client: same method names, never throws ----------
const redisClient = {
  get: (key) => guard(() => realClient.get(key)),
  set: (...args) => guard(() => realClient.set(...args)),
  setex: (...args) => guard(() => realClient.setex(...args)),
  expire: (...args) => guard(() => realClient.expire(...args)),
  del: (...args) => guard(() => realClient.del(...args)),
  unlink: (...args) => guard(() => realClient.unlink(...args)),
  keys: (pattern) => guard(() => realClient.keys(pattern), []),
  pipeline: () => {
    if (!isReady()) return noopPipeline();
    const p = realClient.pipeline();
    const originalExec = p.exec.bind(p);
    p.exec = async () => {
      try {
        return await originalExec();
      } catch {
        return [];
      }
    };
    return p;
  },
};

export default redisClient;

// ---------- Helpers ----------

// A failed/unavailable Redis read is treated as a cache miss
export const safeGet = async (key) => {
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error(`Redis GET failed for ${key}:`, err.message);
    return null;
  }
};

export const clearEventsCache = async () => {
  try {
    const keys = await redisClient.keys(`${REDIS_PREFIX}events:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Failed to clear event cache:", err.message);
  }
};

export const clearSingleEventCache = async (eventId) => {
  try {
    if (!eventId) return;
    // Clears event:single:ID and event:single:ID:ticketID
    const keys = await redisClient.keys(
      `${REDIS_PREFIX}event:single:${eventId}*`,
    );
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error(
      `Failed to clear single event cache for ID ${eventId}:`,
      err.message,
    );
  }
};

export const clearWishListCache = async (userId) => {
  try {
    if (!userId) return;
    await redisClient.unlink(`${REDIS_PREFIX}user:wishlist:${userId}`);
  } catch (err) {
    console.error("Failed to clear wishlist cache:", err.message);
  }
};

export const clearTicketCache = async (userId) => {
  try {
    if (!userId) return;
    await redisClient.del(`${REDIS_PREFIX}user:ticket:list:${userId}`);
  } catch (err) {
    console.error("Failed to clear ticket cache:", err.message);
  }
};

export const clearTicketInfoCache = async (ticketId) => {
  try {
    if (!ticketId) return;
    await redisClient.del(`${REDIS_PREFIX}user:ticket:info:${ticketId}`);
  } catch (err) {
    console.error("Failed to clear ticket info cache:", err.message);
  }
};
