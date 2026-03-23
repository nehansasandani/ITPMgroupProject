import User from "../models/User.js";
import Task from "../models/Task.js";
import Match from "../models/Match.js";

// Helper function: Rank helpers by skill, reputation, and last active
const rankHelpers = (helpers, taskSkill) => {
  return helpers
    .filter(h => h.isAvailable && !h.ongoingTask)
    .sort((a, b) => {
      const skillScoreA = a.skills.includes(taskSkill) ? 1 : 0;
      const skillScoreB = b.skills.includes(taskSkill) ? 1 : 0;
      if (skillScoreB !== skillScoreA) return skillScoreB - skillScoreA;
      if (b.reputation !== a.reputation) return b.reputation - a.reputation;
      return new Date(b.lastActive) - new Date(a.lastActive);
    });
};

// 1️⃣ Create Match (send to top helper)
export const createMatch = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Get all helpers with skill
    const helpers = await User.find({ skills: task.skillRequired });
    const rankedHelpers = rankHelpers(helpers, task.skillRequired);

    if (!rankedHelpers.length) {
      task.status = "Pending"; // No available helper
      await task.save();
      return res.status(404).json({ message: "No available helpers" });
    }

    // Create match for the top helper
    const match = new Match({
      task: task._id,
      helper: rankedHelpers[0]._id
    });
    await match.save();

    // Update task status to "Matched"
    task.status = "Matched";
    await task.save();

    res.status(201).json({ message: "Match request sent ✅", match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Accept Match
export const acceptMatch = async (req, res) => {
  try {
    const { matchId } = req.body;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Mark match as accepted
    match.status = "Accepted";
    await match.save();

    // Update helper
    const helper = await User.findById(match.helper);
    helper.isAvailable = false;
    helper.ongoingTask = match.task;
    helper.lastActive = new Date();
    await helper.save();

    res.json({ message: "Match accepted ✅", match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Timeout & Fallback
export const checkTimeouts = async () => {
  const now = new Date();
  const expiredMatches = await Match.find({ status: "Pending", expiryTime: { $lt: now } });

  for (let match of expiredMatches) {
    const helper = await User.findById(match.helper);

    // Mark current match as timed out
    match.status = "Timeout";
    await match.save();

    // Make helper available again
    if (helper) {
      helper.isAvailable = true;
      helper.ongoingTask = null;
      await helper.save();
    }

    // Try to send to next-best helper
    const task = await Task.findById(match.task);
    const helpers = await User.find({ skills: task.skillRequired });

    // Exclude already timed-out or accepted helpers
    const availableHelpers = helpers.filter(
      h =>
        h.isAvailable &&
        !h.ongoingTask &&
        !expiredMatches.some(em => em.helper.toString() === h._id.toString() && em.status !== "Timeout")
    );

    const rankedHelpers = rankHelpers(availableHelpers, task.skillRequired);

    if (rankedHelpers.length) {
      const nextHelper = rankedHelpers[0];
      const newMatch = new Match({
        task: task._id,
        helper: nextHelper._id
      });
      await newMatch.save();
      console.log(`Task ${task._id}: sent to next helper ${nextHelper.name}`);
    } else {
      // No helper available
      task.status = "Pending"; // Waiting for helper to be free
      await task.save();
      console.log(`Task ${task._id}: no helper available`);
    }
  }
};