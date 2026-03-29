import mongoose from "mongoose";

<<<<<<< HEAD
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
=======
const matchSchema = mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  helper: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Accepted", "Timeout"], default: "Pending" },
  requestTime: { type: Date, default: Date.now },
  expiryTime: { type: Date, default: () => new Date(+new Date() + 10*60*1000) } // 10 min to accept
});
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

const Match = mongoose.model("Match", matchSchema);
export default Match;