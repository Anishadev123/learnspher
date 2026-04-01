import express from 'express'
import Notebook from "../models/Notebook.js"
import Source from "../models/Source.js"
import Chunk from "../models/Chunks.js"
import { index } from '../utils/vectordbClient.js'

const router = express.Router()

router.post('/', async (req, res) => {
    const { name } = req.body
    const nb = await Notebook.create({ name })
    res.json(nb)
})

router.get('/', async (req, res) => {
    try {
        const notebooks = await Notebook.aggregate([
            {
                $lookup: {
                    from: 'sources',
                    localField: '_id',
                    foreignField: 'notebookId',
                    as: 'sources'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(notebooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const nb = await Notebook.findById(req.params.id)
    if (!nb) return res.status(404).json({ error: 'not found' })
    res.json(nb)
})

router.delete('/:id', async (req, res) => {
    try {
        const notebookId = req.params.id;

        // 1️⃣ Find all sources in this notebook
        const sources = await Source.find({ notebookId });

        // 2️⃣ Find all chunks for these sources (to get vector IDs)
        const sourceIds = sources.map(s => s._id);
        const chunks = await Chunk.find({ sourceId: { $in: sourceIds } });
        const vectorIds = chunks.map(c => c.vectorId).filter(Boolean);

        // 3️⃣ Delete vectors from Pinecone
        if (vectorIds.length > 0) {
            try {
                await index.deleteMany(vectorIds);
                console.log(`🗑️ Deleted ${vectorIds.length} vectors from Pinecone for notebook ${notebookId}`);
            } catch (pineconeErr) {
                console.error("⚠️ Pinecone delete error (non-fatal):", pineconeErr.message);
            }
        }

        // 4️⃣ Delete chunks from MongoDB
        await Chunk.deleteMany({ sourceId: { $in: sourceIds } });

        // 5️⃣ Delete sources from MongoDB
        await Source.deleteMany({ notebookId });

        // 6️⃣ Delete the notebook
        await Notebook.findByIdAndDelete(notebookId);

        console.log(`🗑️ Deleted notebook ${notebookId} with ${sources.length} sources and ${chunks.length} chunks`);
        res.json({ ok: true });
    } catch (err) {
        console.error("❌ Notebook delete error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router
