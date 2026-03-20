import mongoose from 'mongoose'
const schema = new mongoose.Schema({
notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' },
type: String, // pdf, youtube, url, text
originalName: String,
storagePath: String,
status: { type: String, default: 'pending' },
metadata: Object,
createdAt: { type: Date, default: Date.now }
})
export default mongoose.model('Source', schema)
