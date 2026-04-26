import mongoose from 'mongoose';

const EndorsementSchema = new mongoose.Schema(
  {
    endorserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endorseeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate endorsements within a session
EndorsementSchema.index({ endorserId: 1, endorseeId: 1, skill: 1, sessionId: 1 }, { unique: true });

// Index for efficient queries
EndorsementSchema.index({ endorseeId: 1, skill: 1 });

export default mongoose.model('Endorsement', EndorsementSchema);
