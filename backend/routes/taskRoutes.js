import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { title, description, skillRequired, duration, mode, createdBy } = req.body;

    const newTask = new Task({
      title,
      description,
      skillRequired,
      duration,
      mode,
      createdBy
    });

    const savedTask = await newTask.save();

    res.status(201).json(savedTask);  // ✅ now you get _id
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;