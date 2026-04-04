import mongoose from "mongoose";

// Stores per-category summary scores
const categoryScoreSchema = new mongoose.Schema({
  category:     { type: String },   // e.g. "Programming"
  subCategory:  { type: String },   // e.g. "Languages"
  skillName:    { type: String },   // e.g. "Python"
  avgClarity:        { type: Number, default: 0 },
  avgEffort:         { type: Number, default: 0 },
  avgTimeCommitment: { type: Number, default: 0 },
  avgCommunication:  { type: Number, default: 0 },
  overallAvg:        { type: Number, default: 0 },
  ratingCount:       { type: Number, default: 0 },
}, { _id: false });

const reputationSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // Overall score 0-100
  score:         { type: Number, default: 50 },

  // Per skill category breakdown
  categoryScores: { type: [categoryScoreSchema], default: [] },

  noShowCount:   { type: Number, default: 0 },
  cooldownUntil: { type: Date, default: null },
  badges:        { type: [String], default: [] },
  lastUpdated:   { type: Date, default: Date.now },
});

export default mongoose.model("Reputation", reputationSchema);