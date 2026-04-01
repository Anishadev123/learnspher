import Source from "../models/Source.js";
import Chunk from "../models/Chunks.js";
import fs from "fs";
import { extractFromPDF, extractFromUrl, extractFromYoutube } from "./extractors.js";
import { chunkText } from "./chunker.js";
import { upsertVectors } from "./vectordbClient.js";
import { embedWithGemini } from "./vectordbClient.js"; // <-- import embedding function

export async function processIngestionJob(data) {
  const { sourceId, filePath, url, text, notebookId } = data;

  const source = await Source.findById(sourceId);
  let rawText = text || "";

  // 1️⃣ Extract Text
  if (source.type === "pdf" && filePath) rawText = await extractFromPDF(filePath);
  else if (source.type === "url" && url) rawText = await extractFromUrl(url);
  else if (source.type === "youtube" && url) rawText = await extractFromYoutube(url);

  rawText = rawText.replace(/\s+/g, " ").trim();

  if (!rawText || rawText.length < 50) {
    console.error("❌ Extraction failed or content too short:", rawText);
    await Source.findByIdAndUpdate(sourceId, {
      status: "failed",
      metadata: { error: "Could not extract content from source." }
    });
    return;
  }

  // 2️⃣ Chunk Text — tune sizes per source type to avoid too many API calls
  const chunkConfig = {
    youtube: { size: 1500, overlap: 200 },
    url:     { size: 2000, overlap: 300 },
    pdf:     { size: 1500, overlap: 300 },
  };
  const { size: chunkSize, overlap } = chunkConfig[source.type] || chunkConfig.pdf;
  let chunks = chunkText(rawText, chunkSize, overlap);

  // ✅ Cap at 30 chunks max to avoid excessive embedding calls
  const MAX_CHUNKS = 30;
  if (chunks.length > MAX_CHUNKS) {
    console.warn(`⚠️ Too many chunks (${chunks.length}), capping at ${MAX_CHUNKS}`);
    chunks = chunks.slice(0, MAX_CHUNKS);
  }

  console.log("🔍 Raw extracted text length:", rawText.length);
  console.log("🔍 Chunk count:", chunks.length);

  // 3️⃣ Generate Gemini Embeddings with rate-limit protection
  console.log("🧠 Generating embeddings for", chunks.length, "chunks...");
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const embeddings = [];
  for (let i = 0; i < chunks.length; i++) {
    let emb = [];
    let retries = 3;
    while (retries > 0) {
      emb = await embedWithGemini(chunks[i]);
      if (emb.length > 0) break;          // success
      retries--;
      const backoff = (3 - retries) * 2000; // 2s, 4s, 6s
      console.log(`⏳ Rate limited, retrying in ${backoff}ms... (${retries} left)`);
      await delay(backoff);
    }
    embeddings.push(emb);
    // Small delay between calls to stay under rate limit
    if (i < chunks.length - 1) await delay(500);
  }
  console.log("✔ Embeddings generated!");

  // 4️⃣ Prepare vectors for Pinecone — SKIP any with failed embeddings
  const allVectors = chunks.map((chunk, i) => ({
    id: `${sourceId}_chunk_${i}`,
    values: embeddings[i],
    metadata: {
      text: chunk,
      sourceId: sourceId.toString(),
      notebookId: notebookId.toString(),
      chunkIndex: i,
    },
  }));

  // ✅ Filter out vectors with empty/failed embeddings (dimension 0)
  const vectors = allVectors.filter(v => v.values && v.values.length > 0);
  if (vectors.length < allVectors.length) {
    console.warn(`⚠️ Skipped ${allVectors.length - vectors.length} chunks with failed embeddings`);
  }

  if (vectors.length === 0) {
    console.error("❌ All embeddings failed. Aborting ingestion.");
    await Source.findByIdAndUpdate(sourceId, {
      status: "failed",
      metadata: { error: "All embeddings failed due to rate limiting." }
    });
    return;
  }

  // 5️⃣ Upsert vectors
  await upsertVectors(vectors);
  console.log("✔ Stored", vectors.length, "vectors in Pinecone");

  // 6️⃣ Save chunks in Mongo — only for successful embeddings
  const successfulIds = new Set(vectors.map(v => v.id));
  const chunkDocs = chunks
    .map((chunk, i) => ({
      sourceId,
      notebookId,
      text: chunk,
      chunkIndex: i,
      vectorId: `${sourceId}_chunk_${i}`,
    }))
    .filter(doc => successfulIds.has(doc.vectorId));

  await Chunk.insertMany(chunkDocs);

  // 7️⃣ Update source as ingested
  await Source.findByIdAndUpdate(sourceId, {
    $set: {
      status: "ingested",
      "metadata.text": rawText,
      "metadata.length": rawText.length,
    }
  });

  // 8️⃣ Delete uploaded file
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

  console.log("✅ Ingestion complete!");
}
