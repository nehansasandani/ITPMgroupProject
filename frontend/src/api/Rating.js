import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  sessionId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  raterId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ratedUserId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Skill context - links to her Skill model
  skillCategory:  { type: String, required: true },   // e.g. "Programming"
  skillSubCategory: { type: String, required: true }, // e.g. "Languages"
  skillName:      { type: String, required: true },   // e.g. "Python"

  // Ratings
  clarity:        { type: Number, min: 1, max: 5, required: true },
  effort:         { type: Number, min: 1, max: 5, required: true },
  timeCommitment: { type: Number, min: 1, max: 5, required: true },
  communication:  { type: Number, min: 1, max: 5, required: true },

  // New: comment field
  comment:        { type: String, maxlength: 500, default: "" },

}, { timestamps: true });

export default mongoose.model("Rating", ratingSchema);