import fs from "fs";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { getYoutubeTranscript } from "./youtube.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// -------------------------------------------------------------------------
// 📘 1. PDF TEXT EXTRACTION (ESM + Node 22 compatible)
// -------------------------------------------------------------------------
export async function extractFromPDF(path) {
  console.log("📘 Extracting text using pdfjs-dist:", path);

  try {
    const pdfData = new Uint8Array(fs.readFileSync(path));
    const pdf = await getDocument({ data: pdfData }).promise;

    let finalText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => item.str).join(" ");
      finalText += strings + " ";
    }

    finalText = finalText.replace(/\s+/g, " ").trim();

    console.log("📘 PDF extracted text length:", finalText.length);

    return finalText;
  } catch (err) {
    console.error("❌ PDF PARSE ERROR:", err);
    return "";
  }
}

// -------------------------------------------------------------------------
// 🌐 2. WEBSITE EXTRACTION
// -------------------------------------------------------------------------
export async function extractFromUrl(url) {
  try {
    const r = await fetch(url);
    const html = await r.text();

    const $ = cheerio.load(html);
    const text = $("article").text() || $("body").text();

    return text.replace(/\s+/g, " ").trim();
  } catch (err) {
    console.error("❌ URL EXTRACT ERROR:", err);
    return "";
  }
}

// -------------------------------------------------------------------------
// 🎥 3. YOUTUBE TRANSCRIPT
// -------------------------------------------------------------------------
export async function extractFromYoutube(urlOrId) {
  try {
    const transcript = await getYoutubeTranscript(urlOrId);
    if (!transcript) return "";
    return transcript.join(" ").replace(/\s+/g, " ").trim();
  } catch (err) {
    console.error("❌ YOUTUBE EXTRACT ERROR:", err);
    return "";
  }
}
