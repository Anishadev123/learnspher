import express from "express";
import { GoogleGenAI } from "@google/genai";
import PDFDocument from "pdfkit";
import Source from "../../src/models/Source.js";

const router = express.Router();

// ✅ Initialize NEW Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1",
});

router.get("/:sourceId", async (req, res) => {
  try {
    const { sourceId } = req.params;
    console.log(`📄 Generating Summary PDF for Source: ${sourceId}`);

    const source = await Source.findById(sourceId);

    if (!source || !source.metadata || !source.metadata.text) {
      console.error("❌ Source text not found in database");
      return res.status(404).json({
        error: "Source text not found or document not yet ingested.",
      });
    }

    // ✅ Limit text size (important)
    const text = source.metadata.text.substring(0, 20000);

    const prompt = `
Generate a professional structured summary.

Requirements:
- Clear section headings
- Bullet points
- Key takeaways
- Easy to read

Text:
${text}
`;

    console.log("🧠 Requesting summary from Gemini...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ Upgraded to latest Gemini 2.5 Flash
      contents: prompt,
    });

    const summary = result.text;

    if (!summary) {
      throw new Error("Gemini returned empty summary");
    }

    console.log("🎨 Creating PDF doc...");

    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    // ✅ Response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="summary-${sourceId}.pdf"`
    );

    doc.pipe(res);

    // 🎨 Title
    doc
      .fillColor("#2B6CB0")
      .fontSize(26)
      .text("Document Summary", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fillColor("#4A5568")
      .fontSize(14)
      .text(source.originalName || "Unnamed Document", {
        align: "center",
      });

    doc.moveDown(1);

    // Divider
    doc
      .strokeColor("#E2E8F0")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(1.5);

    // 📄 Content
    doc
      .fillColor("#1A202C")
      .fontSize(12)
      .text(summary, {
        align: "justify",
        lineGap: 4,
      });

    // 📌 Footer (page numbers)
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc
        .fillColor("#718096")
        .fontSize(10)
        .text(
          `Page ${i + 1} of ${range.count}`,
          0,
          doc.page.height - 40,
          {
            align: "center",
            width: doc.page.width,
          }
        );
    }

    doc.end();

    console.log("✅ PDF piped to response successfully.");

  } catch (error) {
    console.error("❌ PDF generation error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate PDF summary. Please try again.",
      });
    }
  }
});

export default router;