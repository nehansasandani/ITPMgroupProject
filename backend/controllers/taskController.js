import Task, { TaskConfig } from "../models/Task.js";
import { checkTaskClarity } from "../utils/taskScopeRules.js";

export async function createTask(req, res) {
  try {
    const { title, description, expectedOutcome, skillRequired, duration, mode } = req.body;

    // Basic required checks (extra safety)
    if (!title || !description || !expectedOutcome || !skillRequired) {
      return res.status(400).json({
        message: "Missing required fields.",
        required: ["title", "description", "expectedOutcome", "skillRequired"],
      });
    }

    // Duration must be allowed
    if (!TaskConfig.ALLOWED_DURATIONS.includes(Number(duration))) {
      return res.status(400).json({
        message: "Invalid duration. Must be one of 15, 30, 45, 60.",
      });
    }

    // Mode must be allowed (optional)
    if (mode && !TaskConfig.ALLOWED_MODES.includes(mode)) {
      return res.status(400).json({
        message: "Invalid mode. Must be Chat, Meet, or Online.",
      });
    }

    // ✅ Scope control clarity rules
    const issues = checkTaskClarity({ title, description, expectedOutcome });
    if (issues.length) {
      return res.status(400).json({
        message: "Task rejected due to scope/clarity issues.",
        issues,
      });
    }

    // ✅ createdBy comes from middleware (NOT request body)
    const createdBy = req.user.id;

    // Expire in 2 days
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const newTask = await Task.create({
      title,
      description,
      expectedOutcome,
      skillRequired,
      duration: Number(duration),
      mode: mode || "Online",
      createdBy,
      status: "OPEN",
      expiresAt,
    });

    return res.status(201).json(newTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMyTasks(req, res) {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ createdBy: userId }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}