import dotenv from "dotenv";
dotenv.config();

import IORedis from "ioredis";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { processIngestionJob } from "../utils/ingestionProcessor.js";

// 🔥 FIX: Redis must use maxRetriesPerRequest: null
// 🔥 FIX: Redis must use maxRetriesPerRequest: null
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn("⚠️ Redis connection failed. Worker skipped.");
      return null;
    }
    return Math.min(times * 100, 3000);
  }
});

connection.on("error", () => { }); // Prevent crash on error

// 🔥 FIX: Worker MUST connect to MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Worker MongoDB connected");
  } catch (err) {
    console.error("❌ Worker MongoDB connection failed:", err);
    process.exit(1);
  }
}
connectMongo();

// 🔥 INGESTION WORKER
const worker = new Worker(
  "ingestion",
  async (job) => {
    console.log("Worker processing job", job.id, job.name);
    await processIngestionJob(job.data);
  },
  { connection }
);

// 🔥 Events
worker.on("completed", (job) =>
  console.log("Job completed", job.id)
);

worker.on("failed", (job, err) =>
  console.error("❌ Job failed", job?.id, err.message)
);

console.log("Ingestion worker started");
