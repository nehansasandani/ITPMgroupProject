import mongoose from "mongoose";

const matchSchema = mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  helper: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Accepted", "Timeout"], default: "Pending" },
  requestTime: { type: Date, default: Date.now },
  expiryTime: { type: Date, default: () => new Date(+new Date() + 10*60*1000) } // 10 min to accept
});

const Match = mongoose.model("Match", matchSchema);
export default Match;