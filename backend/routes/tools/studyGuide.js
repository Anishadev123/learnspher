import express from "express";
import { GoogleGenAI } from "@google/genai";
import Source from "../../src/models/Source.js";

const router = express.Router();

// ✅ Initialize NEW Gemini client
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

    // ✅ Limit input (important for token + performance)
    const text = source.metadata.text.substring(0, 15000);

    const prompt = `
Create a structured study guide.

Requirements:
- Clear headings
- Key concepts
- Definitions
- Important points
- Exam-style questions at the end

Use simple and easy-to-understand language.

Text:
${text}
`;

    console.log("🧠 Generating study guide with Gemini...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ Upgraded to latest Gemini 2.5 Flash
      contents: prompt,
    });

    const guide = result.text;

    res.json({ guide });

  } catch (error) {
    console.error("❌ Study guide generation error:", error);
    res.status(500).json({ error: "Failed to generate study guide" });
  }
});

export default router;