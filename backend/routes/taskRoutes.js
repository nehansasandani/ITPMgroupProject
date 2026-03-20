import express from "express";
import Task from "../models/Task.js";
import { validateTaskScope } from "../utils/taskScopeValidator.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// CREATE task
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      expectedOutcome,
      category,
      urgency,
      skillRequired,
      duration,
      mode,
      deadlineDays,
      attachmentUrl,
    } = req.body;

    const scope = validateTaskScope({ title, description, expectedOutcome });

    if (!scope.ok) {
      return res.status(400).json({
        message: "Task rejected by scope control",
        issues: scope.issues,
      });
    }

    const task = await Task.create({
      title,
      description,
      expectedOutcome,
      category,
      urgency,
      skillRequired,
      duration,
      mode,
      deadlineDays,
      attachmentUrl: attachmentUrl || "",
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my tasks
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const items = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all OPEN tasks
router.get("/open", requireAuth, async (req, res) => {
  try {
    const items = await Task.find({ status: "OPEN" })
      .populate("createdBy", "fullName studentId")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CANCEL task
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "OPEN") {
      return res.status(400).json({
        message: "Only OPEN tasks can be cancelled",
      });
    }

    task.status = "CANCELLED";
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;