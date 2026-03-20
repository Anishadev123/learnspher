import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import JSON5 from "json5";
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

export const generateStudyMaterial = async (data) => {
  const { title, subject, goal, academicLevel, difficulty, language, learningStyle, keywords } = data;

  const prompt = `
You are an expert educational assistant that creates **exam-ready, comprehensive, and conceptually rich study materials**.

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
Create **detailed study materials** that can serve as reliable notes for exam preparation. 
Focus on clarity, structure, conceptual explanations, and real-world relevance.

Generate the following:

1. **Extensive Notes**
    - Well-organized with clear headings and subheadings.
    - Include definitions, formulas, diagrams (in text if needed), examples, and comparisons.
    - Explain core concepts step-by-step.
    - Add real-world applications and common pitfalls or misconceptions.
    - Length should be sufficient for an in-depth understanding (at least 800–1200 words).

2. **10 Flashcards**
    - Concise Q–A pairs covering definitions, examples, and key differences.

3. **10 Quiz Questions**
    - Mix of MCQs, True/False, and short answers.
    - Provide answer and short explanation for each.

4. **Diagram**
    - If relevant, describe or render in text using Mermaid.js format.
    - Keep it readable and labeled.

5. **Course Outline**
    - Suggest 3–6 logical chapters for learning progression.

### Output Format
Output **only** valid JSON. The structure must be EXACTLY as follows:

{
  "notes": "long and detailed notes as a formatted string with markdown headings and bullet points",
  "flashcards": [{ "question": "...", "answer": "..." }],
  "quiz": [{ "question": "...", "options": ["A","B","C","D"], "answer": "...", "explanation": "..." }],
  "diagram": "...",
  "courseOutline": ["..."]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let outputText = response.text();

    if (!outputText) {
      throw new Error("Received empty response from Gemini model");
    }

    // 🧹 Clean up extra markdown wrappers if present (Gemini sometimes adds them even with JSON mode)
    outputText = outputText
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    // 🧼 Normalize & Parse
    // Using the same robust parsing logic as before
    const sanitized = outputText
      .replace(/\u00A0/g, " ")
      .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
      .replace(/,(\s*[}\]])/g, "$1") // Fix trailing commas
      .replace(/“|”/g, '"')          // Fix smart quotes
      .replace(/‘|’/g, "'")
      .trim();

    try {
      return JSON.parse(sanitized);
    } catch (err) {
      console.error("❌ Failed to parse Gemini output (attempt 1 with JSON.parse):\n", sanitized);
      // Fallback to JSON5
      try {
        return JSON5.parse(sanitized);
      } catch (err2) {
        console.error("❌ Failed to parse Gemini output (attempt 2 with JSON5):\n", sanitized);
        throw new Error("Invalid JSON from model after all sanitization attempts");
      }
    }
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw error;
  }
};