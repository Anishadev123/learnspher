import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source', required: true },
  notebookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notebook', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

noteSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

export default mongoose.model('Note', noteSchema);
