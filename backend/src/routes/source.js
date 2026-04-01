import express from 'express';
import Source from '../models/Source.js';
import Chunk from '../models/Chunks.js';
import { index } from '../utils/vectordbClient.js';

const router = express.Router();

router.get('/:sourceId/status', async (req, res) => {
  const { sourceId } = req.params;
  const src = await Source.findById(sourceId);

  if (!src) {
    return res.status(404).json({ ok: false, message: "Source not found" });
  }

  res.json({
    ok: true,
    status: src.status   // pending | ingested | failed
  });
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find all chunks for this source (to get vector IDs)
    const chunks = await Chunk.find({ sourceId: id });
    const vectorIds = chunks.map(c => c.vectorId).filter(Boolean);

    // 2️⃣ Delete vectors from Pinecone
    if (vectorIds.length > 0) {
      try {
        await index.deleteMany(vectorIds);
        console.log(`🗑️ Deleted ${vectorIds.length} vectors from Pinecone for source ${id}`);
      } catch (pineconeErr) {
        console.error("⚠️ Pinecone delete error (non-fatal):", pineconeErr.message);
      }
    }

    // 3️⃣ Delete chunks from MongoDB
    await Chunk.deleteMany({ sourceId: id });
    console.log(`🗑️ Deleted ${chunks.length} chunks from MongoDB for source ${id}`);

    // 4️⃣ Delete the source document
    await Source.findByIdAndDelete(id);
    console.log(`🗑️ Deleted source ${id}`);

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Source delete error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
