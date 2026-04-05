import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mode: { type: String, enum: ["Chat", "Meet", "Online"], default: "Online" },
    status: { type: String, enum: ["ACTIVE", "COMPLETED"], default: "ACTIVE" },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    venue: { type: String, default: "", trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
