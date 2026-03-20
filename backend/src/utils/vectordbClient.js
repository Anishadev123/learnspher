// ⭐ Load .env first
import dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Debug
console.log("🔍 Pinecone Index:", process.env.PINECONE_INDEX);
console.log("🔍 Gemini key loaded:", !!process.env.GEMINI_API_KEY);

// ⭐ Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pinecone.index(process.env.PINECONE_INDEX);

// ⭐ Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------------------------
// 🔵 Gemini EMBEDDING Function
// ---------------------------
export async function embedWithGemini(text) {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-embedding-001", // 768-dim
    });

    const result = await model.embedContent({
      content: { role: "user", parts: [{ text }] },
      outputDimensionality: 768,
    });
    return result.embedding.values; // 768-dim float array
  } catch (err) {
    console.error("❌ Gemini Embedding Error:", err);
    return [];
  }
}

// ---------------------------
// 🔼 Upsert vectors (Pinecone integrated mode)
// ---------------------------
export async function upsertVectors(vectors) {
  try {
    await index.upsert(vectors);
    console.log("✔ Vectors upserted:", vectors.length);
  } catch (err) {
    console.error("❌ Pinecone Upsert Error:", err);
  }
}

// ---------------------------
// 🔍 Query Pinecone with Gemini embeddings
// ---------------------------
export async function queryVectors(questionText, topK = 6, filter = {}) {
  try {
    console.log("🔍 Generating Gemini embedding for query...");
    const vector = await embedWithGemini(questionText);

    if (!vector || vector.length === 0) {
      throw new Error("Empty query embedding");
    }

    console.log("🔍 Querying Pinecone with filter:", JSON.stringify(filter));

    const queryRequest = {
      vector,
      topK,
      includeMetadata: true,
      includeValues: false,
    };

    if (filter && Object.keys(filter).length > 0) {
      queryRequest.filter = filter;
    }

    const response = await index.query(queryRequest);

    return response.matches || [];
  } catch (err) {
    console.error("❌ Pinecone Query Error:", err);
    return [];
  }
}
