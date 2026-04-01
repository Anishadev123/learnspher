import express from "express";
import { GoogleGenAI } from "@google/genai";
import Source from "../../src/models/Source.js";

const router = express.Router();

// ✅ Initialize NEW Gemini client ONCE
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1",
});

router.post("/:sourceId", async (req, res) => {
  try {
    const { sourceId } = req.params;

    const source = await Source.findById(sourceId);

    if (!source || !source.metadata || !source.metadata.text) {
      return res.status(404).json({ error: "Source text not found" });
    }

    // ✅ Limit input size (important)
    const text = source.metadata.text.substring(0, 12000);

    const prompt = `
Generate a short spoken-style summary.
Make it engaging, simple, and natural to listen.

Text:
${text}
`;

    console.log("🧠 Generating audio summary with Gemini...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ Upgraded to latest Gemini 2.5 Flash
      contents: prompt,
    });

    const summary = result.text;

    res.json({ summary });

  } catch (error) {
    console.error("❌ Audio generation error:", error);
    res.status(500).json({ error: "Failed to generate audio summary" });
  }
});

export default router;