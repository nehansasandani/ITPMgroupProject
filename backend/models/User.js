import mongoose from "mongoose";

const STUDENT_ID_REGEX = /^(IT|BM|EN|HS)\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
      validate: {
        validator: function (value) {
          return /^[A-Za-z\s.'-]+$/.test(value);
        },
        message: "Full name can only contain letters, spaces, apostrophes, dots, and hyphens.",
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Invalid email address"],
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [STUDENT_ID_REGEX, "Invalid studentId format (ex: IT23323452)"],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["STUDENT", "ADMIN"],
      default: "STUDENT",
    },

    abuseCount: {
      type: Number,
      default: 0,
    },

    cooldownUntil: {
      type: Date,
      default: null,
    },

    reputation: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    completedTasksCount: {
      type: Number,
      default: 0,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;