import express from 'express';
import { queryVectors } from '../utils/vectordbClient.js';
import Chunk from '../models/Chunks.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// POST /api/tools/suggest/:sourceId
router.post('/suggest/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;

    // Get chunks from this specific source
    const chunks = await Chunk.find({ sourceId }).limit(5);

    if (chunks.length === 0) {
      return res.json({
        ok: false,
        error: "No content found. Upload a source first.",
      });
    }

    const context = chunks.map(c => c.text).join("\n\n---\n\n");

    const prompt = `
You are a helpful study resource recommender.

Based on the following content from a student's study material, suggest high-quality resources for further learning.

RULES:
- Suggest exactly 3 YouTube videos (real, popular educational channels like Khan Academy, Gate Smashers, Neso Academy, freeCodeCamp, etc.)
- Suggest exactly 3 websites (real educational sites like GeeksForGeeks, W3Schools, MDN, Javatpoint, TutorialsPoint, etc.)
- Suggest exactly 3 books (real, well-known textbooks)
- For each resource, provide: title, url (real working URLs), and a one-line description
- Return ONLY valid JSON, no markdown, no code fences

Return format:
{
  "youtube": [
    { "title": "...", "url": "https://youtube.com/...", "description": "..." }
  ],
  "websites": [
    { "title": "...", "url": "https://...", "description": "..." }
  ],
  "books": [
    { "title": "...", "author": "...", "description": "..." }
  ]
}

Content:
${context.substring(0, 3000)}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let answer = result.text;

    // Clean up markdown fences if present
    answer = answer.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const resources = JSON.parse(answer);
      return res.json({ ok: true, resources });
    } catch {
      console.error("❌ Failed to parse resource suggestions:", answer);
      return res.json({ ok: true, raw: answer });
    }
  } catch (err) {
    console.error("❌ Suggest resources error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
