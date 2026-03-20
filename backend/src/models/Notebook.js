import mongoose from 'mongoose'
const schema = new mongoose.Schema({
name: String,
ownerId: String,
createdAt: { type: Date, default: Date.now }
})
export default mongoose.model('Notebook', schema)