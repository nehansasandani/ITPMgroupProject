import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { validateTaskScope } from "../utils/taskScopeValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { expireOverdueTasks } from "../utils/taskExpiry.js";
// ADD this import at the top of taskRoutes.js
import Session from "../models/Session.js";

const router = express.Router();

function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getPast24Hours() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

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

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (currentUser.cooldownUntil && new Date(currentUser.cooldownUntil) > new Date()) {
      return res.status(403).json({
        message: "You are temporarily blocked from posting tasks.",
        cooldownUntil: currentUser.cooldownUntil,
      });
    }

    const todayCount = await Task.countDocuments({
      createdBy: req.user.id,
      createdAt: { $gte: getStartOfToday() },
    });

    if (todayCount >= 3) {
      return res.status(429).json({
        message: "Daily task limit reached. You can only post 3 tasks per day.",
      });
    }

    const normalizedTitle = (title || "").trim().toLowerCase();

    const recentTasks = await Task.find({
      createdBy: req.user.id,
      createdAt: { $gte: getPast24Hours() },
    });

    const duplicateTask = recentTasks.find(
      (task) => (task.title || "").trim().toLowerCase() === normalizedTitle
    );

    if (duplicateTask) {
      currentUser.abuseCount = (currentUser.abuseCount || 0) + 1;

      if (currentUser.abuseCount >= 3) {
        currentUser.cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        currentUser.abuseCount = 0;
      }

      await currentUser.save();

      return res.status(409).json({
        message: "Duplicate task detected. Similar task was already posted within the last 24 hours.",
      });
    }

    const scope = validateTaskScope({ title, description, expectedOutcome });

    if (!scope.ok) {
      currentUser.abuseCount = (currentUser.abuseCount || 0) + 1;

      if (currentUser.abuseCount >= 3) {
        currentUser.cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        currentUser.abuseCount = 0;
      }

      await currentUser.save();

      return res.status(400).json({
        message: "Task rejected by scope control",
        issues: scope.issues,
      });
    }

    currentUser.abuseCount = 0;
    await currentUser.save();

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
    await expireOverdueTasks();

    const items = await Task.find({ createdBy: req.user.id })
      .populate("acceptedBy", "fullName studentId")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all OPEN tasks
router.get("/open", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

    const items = await Task.find({ status: "OPEN" })
      .populate("createdBy", "fullName studentId")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET tasks accepted by me
router.get("/accepted-by-me", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

    const items = await Task.find({ acceptedBy: req.user.id })
      .populate("createdBy", "fullName studentId")
      .sort({ updatedAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single task (owner only)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AFTER (fixed) ✅
router.patch("/:id/accept", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.status !== "OPEN")
      return res.status(400).json({ message: "Only OPEN tasks can be accepted" });
    if (String(task.createdBy) === String(req.user.id))
      return res.status(400).json({ message: "You cannot accept your own task" });

    // Check if a session already exists (avoid duplicates)
    const existingSession = await Session.findOne({ task: task._id });

    task.status = "MATCHED";
    task.acceptedBy = req.user.id;
    await task.save();

    // ✅ Create session if one doesn't already exist
    if (!existingSession) {
      await Session.create({
        task: task._id,
        poster: task.createdBy,
        helper: req.user.id,
        mode: task.mode || "Online",
        venue: task.venue || "",
        status: "ACTIVE",
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "fullName studentId")
      .populate("acceptedBy", "fullName studentId");

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// COMPLETE task
router.patch("/:id/complete", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

    const task = await Task.findById(req.params.id)
      .populate("createdBy", "fullName studentId")
      .populate("acceptedBy", "fullName studentId");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "MATCHED") {
      return res.status(400).json({ message: "Only MATCHED tasks can be completed" });
    }

    const isOwner = String(task.createdBy._id) === String(req.user.id);
    const isAcceptedUser = task.acceptedBy && String(task.acceptedBy._id) === String(req.user.id);

    if (!isOwner && !isAcceptedUser) {
      return res.status(403).json({ message: "You are not allowed to complete this task" });
    }

    task.status = "COMPLETED";
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("createdBy", "fullName studentId")
      .populate("acceptedBy", "fullName studentId");

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE task (only OPEN and owner only)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "OPEN") {
      return res.status(400).json({
        message: "Only OPEN tasks can be edited",
      });
    }

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

    task.title = title;
    task.description = description;
    task.expectedOutcome = expectedOutcome;
    task.category = category;
    task.urgency = urgency;
    task.skillRequired = skillRequired;
    task.duration = duration;
    task.mode = mode;
    task.deadlineDays = deadlineDays;
    task.attachmentUrl = attachmentUrl || "";
    task.expireAt = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CANCEL task
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  try {
    await expireOverdueTasks();

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

// DELETE task (only CANCELLED and owner only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "CANCELLED") {
      return res.status(400).json({
        message: "Only CANCELLED tasks can be deleted",
      });
    }

    await Task.deleteOne({ _id: task._id });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Temporary repair route — DELETE after running once
router.post("/repair-sessions", requireAuth, async (req, res) => {
  const matchedTasks = await Task.find({ status: "MATCHED", acceptedBy: { $exists: true } });
  let created = 0;
  for (const task of matchedTasks) {
    const exists = await Session.findOne({ task: task._id });
    if (!exists) {
      await Session.create({
        task: task._id,
        poster: task.createdBy,
        helper: task.acceptedBy,
        mode: task.mode || "Online",
        venue: task.venue || "",
        status: "ACTIVE",
      });
      created++;
    }
  }
  res.json({ message: `Repaired ${created} sessions` });
});

export default router;