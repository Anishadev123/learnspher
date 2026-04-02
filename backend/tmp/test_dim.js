import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const result = await client.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: "Hello"
    });
    console.log("Vector length (preview):", result.embeddings[0].values.length);
  } catch (err) {
    console.error("Test error:", err.message);
  }
}

test();
