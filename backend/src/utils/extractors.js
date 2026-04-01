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
// 🌐 2. WEBSITE EXTRACTION (IMPROVED — strips junk content)
// -------------------------------------------------------------------------
export async function extractFromUrl(url) {
  try {
    const r = await fetch(url);
    const html = await r.text();

    const $ = cheerio.load(html);

    // Remove junk elements that add noise
    $("script, style, nav, footer, header, iframe, noscript, svg, img, form, button, input, select, textarea").remove();
    $("[class*='sidebar'], [class*='nav'], [class*='footer'], [class*='header'], [class*='menu'], [class*='ad-'], [class*='advertisement'], [class*='comment'], [class*='related'], [class*='share'], [class*='social'], [id*='sidebar'], [id*='nav'], [id*='footer'], [id*='header'], [id*='menu'], [id*='cookie']").remove();

    // Try to get the main content area first
    let text = $("article").text() || $("main").text() || $("[role='main']").text() || $("body").text();

    text = text.replace(/\s+/g, " ").trim();

    // ✅ Cap at 50K chars to prevent excessive chunking
    const MAX_TEXT_LENGTH = 50000;
    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(`⚠️ Website text too long (${text.length} chars), capping at ${MAX_TEXT_LENGTH}`);
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    console.log("🌐 Website extracted text length:", text.length);
    return text;
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
