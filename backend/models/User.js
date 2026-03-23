import mongoose from "mongoose";

const STUDENT_ID_REGEX = /^(IT|BM|EN|HS)\d{8}$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;