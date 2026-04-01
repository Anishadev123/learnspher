import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import JSON5 from "json5";

dotenv.config();

// ✅ Initialize NEW Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1",
});

export const generateStudyMaterial = async (data) => {
  const {
    title,
    subject,
    goal,
    academicLevel,
    difficulty,
    language,
    learningStyle,
    keywords,
  } = data;

  const prompt = `
You are an expert educational assistant that creates exam-ready, structured study materials.

### Context
Topic: ${title}
Subject: ${subject}
Goal: ${goal}
Academic Level: ${academicLevel}
Difficulty: ${difficulty}
Language: ${language}
Learning Style: ${learningStyle}
Focus Areas: ${keywords.join(", ")}

### Instructions
Generate:

1. Extensive Notes (800–1200 words, structured, examples, real-world use)
2. 10 Flashcards (Q-A)
3. 10 Quiz Questions (MCQ/TF/Short + answers + explanation)
4. Diagram (Mermaid or text)
5. Course Outline (3–6 chapters)

### Output Rules
- Return ONLY valid JSON
- No markdown wrappers
- No explanation outside JSON

### JSON FORMAT
{
  "notes": "...",
  "flashcards": [{ "question": "...", "answer": "..." }],
  "quiz": [{ "question": "...", "options": ["A","B","C","D"], "answer": "...", "explanation": "..." }],
  "diagram": "...",
  "courseOutline": ["..."]
}
`;

  try {
    console.log("🧠 Generating study material...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ Upgraded to latest Gemini 2.5 Flash
      contents: prompt,
    });

    let outputText = result.text;

    if (!outputText) {
      throw new Error("Empty response from Gemini");
    }

    // 🧹 Clean markdown wrappers
    outputText = outputText
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    // 🧼 Sanitize JSON
    const sanitized = outputText
      .replace(/\u00A0/g, " ")
      .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/“|”/g, '"')
      .replace(/‘|’/g, "'")
      .trim();

    try {
      return JSON.parse(sanitized);
    } catch (err) {
      console.error("❌ JSON.parse failed:\n", sanitized);

      // fallback
      try {
        return JSON5.parse(sanitized);
      } catch (err2) {
        console.error("❌ JSON5 parse failed:\n", sanitized);
        throw new Error("Invalid JSON from Gemini");
      }
    }

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw error;
  }
};