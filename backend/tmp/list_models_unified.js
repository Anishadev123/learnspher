import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function list() {
  try {
    console.log("Listing models...");
    const models = await client.models.list();
    console.log("Available models:");
    models.forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supportedMethods.join(", ")})`);
    });
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

list();
