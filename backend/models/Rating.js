import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  sessionId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  raterId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ratedUserId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clarity:        { type: Number, min: 1, max: 5, required: true },
  effort:         { type: Number, min: 1, max: 5, required: true },
  timeCommitment: { type: Number, min: 1, max: 5, required: true },
  communication:  { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

export default mongoose.model("Rating", ratingSchema);