import express from "express";
import { queryVectors } from "../utils/vectordbClient.js";
import Chunk from "../models/Chunks.js";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// ✅ Initialize NEW Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  // ❌ DO NOT use apiVersion: "v1" — it breaks generateContent
});

router.post("/:notebookId", async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { question, mode = "answer" } = req.body;

    console.log("🔍 Searching Pinecone...");
    const matches = await queryVectors(question, 6, { notebookId });

    console.log(`🔍 Found ${matches.length} matches in Pinecone.`);
    matches.forEach((m) =>
      console.log(`  - Match: ${m.id} (Score: ${m.score})`)
    );

    const vectorIds = matches.map((m) => m.id);

    const chunks = await Chunk.find({
      vectorId: { $in: vectorIds },
    });

    console.log(
      `🔍 Found ${chunks.length} chunks in MongoDB for these vector IDs.`
    );

    // ✅ Limit context (important for performance)
    const topChunks = chunks.slice(0, 4);

    const context = topChunks
      .map(
        (c, i) =>
          `Source: ${c.sourceId} | Chunk: ${i}\n${c.text}`
      )
      .join("\n\n---\n\n");

    // ✅ Stronger system prompt (reduces hallucination)
    const systemPrompt = `
You are a helpful RAG AI assistant.

STRICT RULES:
- Use ONLY the given context
- If answer is not present, reply EXACTLY: "NOT FOUND"
- Do NOT guess or hallucinate
- Always cite sources like: (Source <sourceId>, Chunk <chunkIndex>)
`;

    const finalPrompt = `
${systemPrompt}

Context:
${context}

Question:
${question}

Answer:
`;

    console.log("🧠 Generating answer with Gemini...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

    const answer = result.text;
    console.log("✅ Gemini answer:", answer?.substring(0, 200));

    // ===========================
    // MODE: ANSWER
    // ===========================
    if (mode === "answer") {
      return res.json({ answer, sources: matches });
    }

    // ===========================
    // MODE: SUMMARY / STUDY GUIDE
    // ===========================
    if (mode === "summary" || mode === "study_guide") {
      const instruction =
        mode === "study_guide"
          ? "Create a structured study guide with headings, key concepts, and flow."
          : "Write a concise summary.";

      const summaryPrompt = `
${instruction}

Context:
${context}
`;

      const out = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: summaryPrompt,
      });

      return res.json({
        answer: out.text,
        sources: matches,
      });
    }

    // ===========================
    // MODE: AUDIO
    // ===========================
    if (mode === "audio") {
      const audioPrompt = `
Give a 90-second spoken explanation.

Question:
${question}

Use ONLY this context:
${context}
`;

      const resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: audioPrompt,
      });

      const speechText = resp.text;

      const { textToSpeechAndStore } = await import("../utils/tts.js");
      const audioUrl = await textToSpeechAndStore(speechText, notebookId);

      return res.json({
        audioUrl,
        text: speechText,
        sources: matches,
      });
    }

    // ===========================
    // MODE: PDF REPORT
    // ===========================
    if (mode === "pdf_report") {
      const reportPrompt = `
Create a detailed report.

Question:
${question}

Use ONLY this context:
${context}
`;

      const resp = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: reportPrompt,
      });

      const reportText = resp.text;

      const { createPdfReport } = await import("../utils/pdfReport.js");
      const pdfUrl = await createPdfReport(reportText, notebookId);

      return res.json({ pdfUrl, sources: matches });
    }

    // ===========================
    // DEFAULT
    // ===========================
    return res.json({ answer, sources: matches });

  } catch (err) {
    console.error("❌ RAG Query Error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;