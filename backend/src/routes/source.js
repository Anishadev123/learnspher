import express from 'express';
import Source from '../models/Source.js';

const router = express.Router();

router.get('/:sourceId/status', async (req, res) => {
  const { sourceId } = req.params;
  const src = await Source.findById(sourceId);

  if (!src) {
    return res.status(404).json({ ok: false, message: "Source not found" });
  }

  res.json({
    ok: true,
    status: src.status   // pending | ingested
  });
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Source.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
