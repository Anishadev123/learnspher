import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn("⚠️ Redis connection failed. Ingestion queue disabled.");
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

connection.on("error", (err) => {
  // Suppress unhandled error crashes
});

const realQueue = new Queue("ingestion", {
  connection,
});

export const ingestionQueue = {
  add: async (name, data, opts) => {
    if (connection.status !== "ready") {
      console.warn(`⚠️ Redis not ready. Skipping job: ${name}`);
      return null;
    }
    return realQueue.add(name, data, opts);
  },
};
