import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Source from "../../src/models/Source.js";

const router = express.Router();

router.post("/:sourceId", async (req, res) => {
    try {
        const { sourceId } = req.params;
        const source = await Source.findById(sourceId);

        if (!source || !source.metadata || !source.metadata.text) {
            return res.status(404).json({ error: "Source text not found" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Generate a short spoken-style summary of the following text. The summary should be engaging and easy to listen to:\n\n${source.metadata.text.substring(0, 15000)}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary });
    } catch (error) {
        console.error("Audio generation error:", error);
        res.status(500).json({ error: "Failed to generate audio summary" });
    }
});

export default router;
