// ⭐ LOAD ENV FIRST — BEFORE ANYTHING ELSE ⭐
import dotenv from "dotenv";
dotenv.config();
console.log("ENV LOADED:", process.env.PINECONE_API_KEY ? "YES" : "NO");

import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 8080;

// Debug log to verify env loading
console.log("Pinecone API Key from server.js:", process.env.PINECONE_API_KEY);
console.log("Cloudinary Keys Loaded:", process.env.CLOUDINARY_API_KEY);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });
