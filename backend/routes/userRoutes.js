import express from "express";
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
