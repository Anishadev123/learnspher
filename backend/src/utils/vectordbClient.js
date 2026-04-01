// ⭐ Load environment variables
import dotenv from "dotenv";
dotenv.config();

// ⭐ Imports
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

// ---------------------------
// 🔍 Debug Logs
// ---------------------------
console.log("🔍 Pinecone Index:", process.env.PINECONE_INDEX);
console.log("🔍 Gemini key loaded:", !!process.env.GEMINI_API_KEY);

// ---------------------------
// 🌲 Initialize Pinecone
// ---------------------------
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pinecone.index(process.env.PINECONE_INDEX);

// ---------------------------
// 🤖 Initialize Gemini (IMPORTANT FIX)
// ---------------------------
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  // ❌ DO NOT USE apiVersion: "v1"
});

// ---------------------------
// 🔵 EMBEDDING FUNCTION (FIXED)
// ---------------------------
export async function embedWithGemini(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Empty input text");
    }

    console.log("🔹 Generating embedding...");

    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 768,  // Truncate to match Pinecone index dimension
      },
    });

    // Debug: log response keys to diagnose structure
    console.log("🔹 Embedding response keys:", Object.keys(result));

    // ✅ Handle both possible response structures
    let values = null;
    if (result.embedding && result.embedding.values) {
      values = result.embedding.values;
    } else if (result.embeddings && result.embeddings.length > 0 && result.embeddings[0].values) {
      values = result.embeddings[0].values;
    }

    if (!values || values.length === 0) {
      console.error("❌ Full embedding response:", JSON.stringify(result, null, 2));
      throw new Error("Invalid embedding response");
    }

    console.log("✅ Embedding generated, dimension:", values.length);
    return values;
  } catch (err) {
    console.error("❌ Gemini Embedding Error:", err.message);
    return [];
  }
}

// ---------------------------
// 🔼 UPSERT VECTORS
// ---------------------------
export async function upsertVectors(vectors) {
  try {
    if (!vectors || vectors.length === 0) {
      throw new Error("No vectors to upsert");
    }

    await index.upsert(vectors);

    console.log("✔ Vectors upserted:", vectors.length);
  } catch (err) {
    console.error("❌ Pinecone Upsert Error:", err.message);
  }
}

// ---------------------------
// 🔍 QUERY VECTORS (RAG SEARCH)
// ---------------------------
export async function queryVectors(questionText, topK = 6, filter = {}) {
  try {
    console.log("🔍 Generating embedding for query...");

    const vector = await embedWithGemini(questionText);

    if (!vector || vector.length === 0) {
      throw new Error("Empty query embedding");
    }

    console.log("🔍 Querying Pinecone...");

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

    console.log("🔍 Matches found:", response.matches?.length || 0);

    return response.matches || [];
  } catch (err) {
    console.error("❌ Pinecone Query Error:", err.message);
    return [];
  }
}