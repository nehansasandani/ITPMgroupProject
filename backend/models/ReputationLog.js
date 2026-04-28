import mongoose from 'mongoose';

const ReputationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    oldScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    newScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    delta: {
      type: Number,
      required: true,
      // delta = newScore - oldScore (can be positive or negative)
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'rating_received',
        'session_completed',
        'session_noshow',
        'endorsement_received',
        'badge_earned',
        'penalty_applied',
        'dispute_opened',
        'dispute_resolved',
        'manual_adjustment',
      ],
    },
    relatedId: {
      // ID of the related entity (ratingId, sessionId, endorsementId, etc.)
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      // Additional context (e.g., which skill was endorsed, badge name, etc.)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Index for efficient history queries
ReputationLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ReputationLog', ReputationLogSchema);
