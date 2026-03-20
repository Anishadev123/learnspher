import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";
import Source from "../../src/models/Source.js";

const router = express.Router();

router.get("/:sourceId", async (req, res) => {
    try {
        const { sourceId } = req.params;
        const source = await Source.findById(sourceId);

        if (!source || !source.metadata || !source.metadata.text) {
            return res.status(404).json({ error: "Source text not found" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Generate a comprehensive summary of the following text suitable for a PDF report:\n\n${source.metadata.text.substring(0, 20000)}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        const doc = new PDFDocument();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="summary-${sourceId}.pdf"`);

        doc.pipe(res);

        doc.fontSize(20).text(`Summary: ${source.originalName || "Document"}`, { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(summary, { align: "justify" });

        doc.end();
    } catch (error) {
        console.error("PDF generation error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate PDF" });
        }
    }
});

export default router;
