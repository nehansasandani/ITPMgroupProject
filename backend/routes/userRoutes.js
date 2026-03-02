import express from "express";
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