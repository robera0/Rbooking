import "dotenv/config";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Key prefix to avoid collisions with other apps sharing the same Redis URL
export const REDIS_PREFIX = "paysso:";

const redisClient = new Redis(REDIS_URL, {
  // Fail fast instead of letting a command hang for tens of seconds when
  // Redis is briefly unreachable - callers should fall back to the DB.
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  commandTimeout: 2000,
  // ioredis's default retryStrategy retries forever with backoff, which on
  // a host with no Redis at all (or one that's simply down) means an
  // endless reconnect-and-log loop. Cap it so it gives up after a few
  // tries and goes quiet instead of flooding the logs indefinitely -
  // every call is already routed through safeRedis()/the clear* helpers,
  // so callers fall back to MongoDB regardless of whether this ever
  // reconnects.
  retryStrategy: (times) => {
    if (times > 5) return null;
    return Math.min(times * 200, 2000);
  },
});
console.log("REDIS_URL:", REDIS_URL || "(not set - caching disabled, all reads/writes fall back to MongoDB)");
redisClient.on("connect", () =>
  console.log("Redis Connected Successfully  via ioredis"),
);
// Log only the first error, not every single retry attempt - once
// retryStrategy above gives up, ioredis would otherwise keep emitting one
// of these per failed reconnect forever.
let loggedRedisError = false;
redisClient.on("error", (err) => {
  if (!loggedRedisError) {
    console.error("Redis unavailable, continuing without cache:", err.message);
    loggedRedisError = true;
  }
});
redisClient.on("reconnect", () => console.log("Redis Reconnected"));
redisClient.on("ready", () => {
  loggedRedisError = false;
});
export default redisClient;

// Wraps any Redis operation so a slow/unavailable Redis (or a host that
// simply doesn't provision Redis) never fails or blocks the request -
// callers treat a rejected/failed op as a cache miss/no-op and fall back
// to MongoDB, which is always the source of truth for this data.
export const safeRedis = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (err) {
    console.error("Redis operation failed, continuing without cache:", err.message);
    return fallback;
  }
};

// Wraps a Redis read so a slow/unavailable Redis never blocks the request -
// callers treat a rejected/failed read the same as a cache miss.
export const safeGet = async (key) => safeRedis(() => redisClient.get(key));

export const clearEventsCache = async () => {
  try {
    // Two prefixes are in use: "events:" (featured) and "event:list:"
    // (filtered lists). Clearing only the first left lists stale.
    const keys = [
      ...(await redisClient.keys(`${REDIS_PREFIX}events:*`)),
      ...(await redisClient.keys(`${REDIS_PREFIX}event:list:*`)),
    ];
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
