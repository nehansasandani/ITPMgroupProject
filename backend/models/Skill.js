import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    skill: { type: String, required: true },
    level: { type: String, required: true },
  },
  { timestamps: true }
);

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
