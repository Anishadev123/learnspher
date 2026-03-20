import express from 'express'
import Notebook from "../models/Notebook.js"

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
        await Notebook.findByIdAndDelete(req.params.id);
        // Optional: delete associated sources too?
        // await Source.deleteMany({ notebookId: req.params.id }); 
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router
