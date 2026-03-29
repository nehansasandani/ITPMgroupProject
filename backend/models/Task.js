import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
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

    expectedOutcome: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200,
    },

    category: {
      type: String,
      enum: ["UI", "CODING", "WRITING", "REVIEW"],
      required: true,
      default: "CODING",
    },

    urgency: {
      type: String,
      enum: ["NORMAL", "URGENT"],
      default: "NORMAL",
    },

    skillRequired: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    duration: {
      type: Number,
      enum: [15, 30, 45, 60],
      default: 30,
    },

    mode: {
      type: String,
      enum: ["Chat", "Meet", "Online"],
      default: "Online",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["OPEN", "MATCHED", "COMPLETED", "CANCELLED", "EXPIRED"],
      default: "OPEN",
      index: true,
    },

    deadlineDays: {
      type: Number,
      enum: [2, 3],
      default: 2,
    },

    expireAt: {
      type: Date,
      default: function () {
        const days = this.deadlineDays || 2;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
      index: true,
    },

    attachmentUrl: {
      type: String,
      default: "",
    },

    // Campus meeting venue — required when mode is "Meet"
    venue: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;