import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudySessionSchema = new Schema({
  userId:       { type: String, required: true, index: true },
  notebookId:   { type: String, default: null },
  materialId:   { type: String, default: null },

  // Timing
  startedAt:    { type: Date, required: true },
  endedAt:      { type: Date },

  // Duration breakdown (in seconds)
  inAppTime:        { type: Number, default: 0 },
  externalTime:     { type: Number, default: 0 },
  idleTime:         { type: Number, default: 0 },
  totalTime:        { type: Number, default: 0 },

  // Activity signals
  activities: {
    messagesAsked:      { type: Number, default: 0 },
    sourcesOpened:       { type: Number, default: 0 },
    notesWritten:        { type: Number, default: 0 },
    summariesGenerated:  { type: Number, default: 0 },
    studyGuidesViewed:   { type: Number, default: 0 },
    externalClicks: [{
      type:       { type: String },        // 'youtube' | 'website'
      url:        { type: String },
      leftAt:     { type: Date },
      returnedAt: { type: Date },
      duration:   { type: Number }         // seconds
    }]
  },

  // Productivity score (0-100)
  productivityScore: { type: Number, default: 0 },

  // Page context
  page: { type: String, enum: ['ai_studio', 'study_material', 'dashboard'], default: 'ai_studio' }
}, { timestamps: true });

// Index for fast queries
StudySessionSchema.index({ userId: 1, startedAt: -1 });
StudySessionSchema.index({ userId: 1, createdAt: -1 });

const StudySession = mongoose.model('StudySession', StudySessionSchema);
export default StudySession;
