import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },  // ✅ Link with Firebase user
  title: String,
  subject: String,
  goal: String,
  academicLevel: String,
  difficulty: String,
  language: String,
  learningStyle: String,
  keywords: [String],
  output: {
    notes: String,
    flashcards: [{ question: String, answer: String }],
    quiz: [{ question: String, options: [String], answer: String, explanation: String }],
    diagram: String,
    courseOutline: [String],
  },
}, { timestamps: true });

export default mongoose.model("StudyMaterial", studyMaterialSchema);
