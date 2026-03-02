import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: [{ type: String }], // e.g., ['UI', 'Coding', 'Writing']
  reputation: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: false },
  ongoingTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
});

const User = mongoose.model("User", userSchema);
export default User;