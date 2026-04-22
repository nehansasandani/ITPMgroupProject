import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    reason: {
      type: String,
      enum: [
        "No-show",
        "Late arrival",
        "Poor help quality",
        "Task not completed",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Resolved - Penalty Applied",
        "Resolved - Dismissed",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);