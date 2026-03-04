import mongoose from "mongoose";

const ALLOWED_DURATIONS = [15, 30, 45, 60];
const ALLOWED_MODES = ["Chat", "Meet", "Online"];
const ALLOWED_STATUS = ["OPEN", "MATCHED", "COMPLETED", "CANCELLED", "EXPIRED"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 800,
    },

    // 🔥 This forces clarity (scope control)
    expectedOutcome: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200,
    },

    skillRequired: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    duration: {
      type: Number,
      required: true,
      enum: ALLOWED_DURATIONS,
      default: 30,
    },

    mode: {
      type: String,
      enum: ALLOWED_MODES,
      default: "Online",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ALLOWED_STATUS,
      default: "OPEN",
      index: true,
    },

    // ⏳ TTL auto-expiry (Mongo will auto-delete after expiresAt)
    // If you prefer NOT deleting, tell me — we’ll switch to marking EXPIRED instead.
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export const TaskConfig = {
  ALLOWED_DURATIONS,
  ALLOWED_MODES,
  ALLOWED_STATUS,
};

const Task = mongoose.model("Task", taskSchema);
export default Task;