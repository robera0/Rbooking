import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: "Server/.env" });
const redisClient = new Redis(process.env.REDIS_URL);
async function run() {
  const keys = await redisClient.keys("paysso:event:single:*");
  if (keys.length > 0) await redisClient.del(keys);
  console.log("Deleted", keys.length, "keys");
  process.exit(0);
}
run();
