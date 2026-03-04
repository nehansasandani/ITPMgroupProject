import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export async function register(req, res) {
  try {
    const { fullName, email, studentId, password, role } = req.body;

    // Basic checks
    if (!fullName || !email || !studentId || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Prevent random role assignment from frontend (security)
    // Only allow STUDENT/HELPER during registration, ADMIN should be created manually.
    const safeRole = role === "HELPER" ? "HELPER" : "STUDENT";

    // Check duplicates
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ message: "Email already exists." });

    const existingStudentId = await User.findOne({ studentId: studentId.toUpperCase() });
    if (existingStudentId) return res.status(409).json({ message: "Student ID already exists." });

    // Password hash
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      studentId: studentId.toUpperCase(),
      passwordHash,
      role: safeRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    // Mongoose validation errors show nicely
    return res.status(400).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { emailOrStudentId, password } = req.body;

    if (!emailOrStudentId || !password) {
      return res.status(400).json({ message: "Missing credentials." });
    }

    const key = emailOrStudentId.trim();
    const query = key.includes("@")
      ? { email: key.toLowerCase() }
      : { studentId: key.toUpperCase() };

    const user = await User.findOne(query).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    const token = signToken(user);

    return res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}