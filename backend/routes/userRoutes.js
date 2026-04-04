import express from "express";
import { register, login, updateProfile } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", requireAuth, async (req, res) => {
  res.json({ message: "You are authenticated ✅", user: req.user });
});
router.put("/me", requireAuth, updateProfile);

// Admin-only example route
router.get("/admin-only", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Welcome Admin ✅" });
});

export default router;