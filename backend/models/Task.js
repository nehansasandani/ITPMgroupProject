import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  skillRequired: { type: String, required: true },
  duration: { type: Number, default: 30 }, // minutes
  mode: { type: String, enum: ["Chat", "Meet", "Online"], default: "Online" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Matched", "Completed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: () => new Date(+new Date() + 2*24*60*60*1000) } // 2 days expiration
});

const Task = mongoose.model("Task", taskSchema);
export default Task;