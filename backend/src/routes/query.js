import express from "express";
import { queryVectors } from "../utils/vectordbClient.js";
import Chunk from "../models/Chunks.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// ⭐ Initialize Gemini Chat Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});



router.post("/:notebookId", async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { question, mode = "answer" } = req.body;

    console.log("🔍 Searching Pinecone...");
    const matches = await queryVectors(question, 6, { notebookId });
    console.log(`🔍 Found ${matches.length} matches in Pinecone.`);
    matches.forEach(m => console.log(`  - Match: ${m.id} (Score: ${m.score})`));

    const vectorIds = matches.map((m) => m.id);
    const chunks = await Chunk.find({ vectorId: { $in: vectorIds } });
    console.log(`🔍 Found ${chunks.length} chunks in MongoDB for these vector IDs.`);

    const context = chunks
      .map((c) => `Source: ${c.sourceId}\n${c.text}`)
      .join("\n\n---\n\n");

    const systemPrompt = `
You are a helpful RAG AI assistant. 
Use ONLY the given context. 
If the answer is not in context, reply EXACTLY: "NOT FOUND"
Provide citations like: (Source <sourceId>, chunk <chunkIndex>)
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
    const result = await chatModel.generateContent(finalPrompt);
    const answer = result.response.text();

    // MODE: ANSWER
    if (mode === "answer") {
      return res.json({ answer, sources: matches });
    }

    // MODE: SUMMARY / STUDY GUIDE
    if (mode === "summary" || mode === "study_guide") {
      const instruction =
        mode === "study_guide"
          ? "Create a structured study guide with key concepts, definitions, and learning flow."
          : "Write a concise summary of this content.";

      const summaryPrompt = `
${instruction}

Context:
${context}
`;

      const out = await chatModel.generateContent(summaryPrompt);
      return res.json({
        answer: out.response.text(),
        sources: matches,
      });
    }

    // MODE: AUDIO (TTS handled separately)
    if (mode === "audio") {
      const audioPrompt = `
Give a 90-second spoken explanation for the question:

${question}

Use ONLY this context:
${context}
`;

      const resp = await chatModel.generateContent(audioPrompt);
      const speechText = resp.response.text();

      const { textToSpeechAndStore } = await import("../utils/tts.js");
      const audioUrl = await textToSpeechAndStore(speechText, notebookId);

      return res.json({
        audioUrl,
        text: speechText,
        sources: matches,
      });
    }

    // MODE: PDF REPORT
    if (mode === "pdf_report") {
      const reportPrompt = `
Create a detailed report answering:

${question}

Use ONLY this context:
${context}
`;

      const resp = await chatModel.generateContent(reportPrompt);
      const reportText = resp.response.text();

      const { createPdfReport } = await import("../utils/pdfReport.js");
      const pdfUrl = await createPdfReport(reportText, notebookId);

      return res.json({ pdfUrl, sources: matches });
    }

    // DEFAULT FALLBACK
    return res.json({ answer, sources: matches });
  } catch (err) {
    console.error("❌ RAG Query Error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
