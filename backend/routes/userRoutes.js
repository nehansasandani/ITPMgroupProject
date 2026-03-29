import express from "express";
<<<<<<< HEAD
import { register, login } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Auth check (used by frontend boot)
router.get("/me", requireAuth, async (req, res) => {
  res.json({ message: "You are authenticated ✅", user: req.user });
});

// Full profile with reputation, completions, and skill count
router.get("/me/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "fullName email studentId role reputation completedTasksCount lastActive createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const skillCount = await Skill.countDocuments({ userId: req.user.id });

    return res.json({ ...user.toObject(), skillCount });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Admin-only example route
router.get("/admin-only", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Welcome Admin ✅" });
});

export default router;
=======
import User from "../models/User.js";

const router = express.Router();

// Create a new user
router.post("/create", async (req, res) => {
  try {
    const { name, email, skills, reputation, isAvailable } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      skills,
      reputation: reputation || 0,
      isAvailable: isAvailable || true,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Optional: Get all users (for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
