import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Timeout", "Cancelled"],
      default: "Pending",
    },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", default: null },
    requestTime: { type: Date, default: Date.now },
    expiryTime: {
      type: Date,
      default: () => new Date(+new Date() + 10 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;