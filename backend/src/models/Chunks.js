import mongoose from 'mongoose'
const schema = new mongoose.Schema({
sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' },
text: String,
pageNumber: Number,
chunkIndex: Number,
vectorId: String,
createdAt: { type: Date, default: Date.now }
})
export default mongoose.model('Chunk', schema)