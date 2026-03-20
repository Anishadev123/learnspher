import express from "express";
import Source from "../../src/models/Source.js";

const router = express.Router();

router.get("/:sourceId", async (req, res) => {
    try {
        const { sourceId } = req.params;
        const source = await Source.findById(sourceId);

        if (!source || !source.metadata || !source.metadata.text) {
            return res.status(404).json({ error: "Source text not found" });
        }

        const text = source.metadata.text;
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        const characterCount = text.length;
        const readingTime = Math.ceil(wordCount / 200); // Minutes

        // Simple difficulty heuristic (avg word length)
        const avgWordLength = characterCount / wordCount;
        let difficulty = "Medium";
        if (avgWordLength < 4.5) difficulty = "Easy";
        if (avgWordLength > 6) difficulty = "Hard";

        res.json({
            wordCount,
            characterCount,
            readingTime,
            difficulty
        });
    } catch (error) {
        console.error("Report generation error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

export default router;
