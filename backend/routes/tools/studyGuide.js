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

        const prompt = `Create a structured study guide with headings, key concepts, definitions, and exam questions based on the following text:\n\n${source.metadata.text.substring(0, 20000)}`;

        const result = await model.generateContent(prompt);
        const guide = result.response.text();

        res.json({ guide });
    } catch (error) {
        console.error("Study guide generation error:", error);
        res.status(500).json({ error: "Failed to generate study guide" });
    }
});

export default router;
