import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    skillId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Skill" },
    skillName: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctIndex: { type: Number, required: true },
        explanation: { type: String, required: true },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // Expiration 30 minutes
      index: { expires: "0" }, // TTL index
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
