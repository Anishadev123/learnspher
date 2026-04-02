import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  // No apiVersion here
});

async function test() {
  try {
    console.log("Testing embedding...");
    const result = await client.models.embedContent({
      model: "gemini-embedding-001",
      contents: "Hello world"
    });
    console.log("Full Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test error:", err.message);
  }
}

test();
