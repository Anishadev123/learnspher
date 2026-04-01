import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

// GET all notes for a notebook
router.get('/notebook/:notebookId', async (req, res) => {
  try {
    const notes = await Note.find({ notebookId: req.params.notebookId })
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all notes for a source
router.get('/source/:sourceId', async (req, res) => {
  try {
    const notes = await Note.find({ sourceId: req.params.sourceId })
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create/update a note for a source
router.post('/', async (req, res) => {
  try {
    const { sourceId, notebookId, text } = req.body;

    if (!sourceId || !notebookId || !text?.trim()) {
      return res.status(400).json({ error: 'sourceId, notebookId, and text are required' });
    }

    // Upsert: update existing note for this source, or create new
    const note = await Note.findOneAndUpdate(
      { sourceId },
      { sourceId, notebookId, text: text.trim(), updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    console.log(`📝 Note saved for source ${sourceId}`);
    res.json({ ok: true, note });
  } catch (err) {
    console.error("❌ Note save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a note
router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
