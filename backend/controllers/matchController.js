import User from "../models/User.js";
import Task from "../models/Task.js";
import Match from "../models/Match.js";
<<<<<<< HEAD
import Skill from "../models/Skill.js";
import Session from "../models/Session.js";

// ── Scoring constants ──────────────────────────────────────────────────────────
const LEVEL_SCORES = { Expert: 30, Intermediate: 20, Beginner: 10 };
const MAX_COMPLETION_SCORE = 20;
const RECENT_ACTIVITY_BONUS = 10;
const RECENT_ACTIVITY_WINDOW_MS = 24 * 60 * 60 * 1000;
const URGENT_MULTIPLIER = 1.2;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Rule-based scoring: skill level + reputation + completions + recency
function computeScore(user, skillLevel, task) {
  let score = 0;

  // Skill level match
  score += LEVEL_SCORES[skillLevel] || 0;

  // Reputation on 0–5 scale → up to 50 pts
  score += (user.reputation || 0) * 10;

  // Prior completions → up to 20 pts
  score += Math.min((user.completedTasksCount || 0) * 2, MAX_COMPLETION_SCORE);

  // Recent activity bonus
  if (user.lastActive) {
    const elapsed = Date.now() - new Date(user.lastActive).getTime();
    if (elapsed < RECENT_ACTIVITY_WINDOW_MS) score += RECENT_ACTIVITY_BONUS;
  }

  // Boost score for urgent tasks
  if (task.urgency === "URGENT") score = Math.round(score * URGENT_MULTIPLIER);

  return score;
}

// ── GET /api/match/candidates/:taskId ─────────────────────────────────────────
// Returns ranked list of candidates for the task owner
export const getRankedCandidates = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (String(task.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the task owner can view candidates" });
    }
    if (task.status !== "OPEN") {
      return res.status(400).json({ message: "Task is not open for matching" });
    }

    // Flexible skill match: search skill name, subCategory, or category
    const pattern = new RegExp(escapeRegex(task.skillRequired), "i");
    const matchingSkills = await Skill.find({
      $or: [{ skill: pattern }, { subCategory: pattern }, { category: pattern }],
    });

    if (!matchingSkills.length) return res.json({ candidates: [], taskSkill: task.skillRequired });

    // userId → highest skill level
    const skillMap = {};
    const levelOrder = ["Beginner", "Intermediate", "Expert"];
    for (const s of matchingSkills) {
      const uid = s.userId.toString();
      const existing = skillMap[uid];
      if (!existing || levelOrder.indexOf(s.level) > levelOrder.indexOf(existing)) {
        skillMap[uid] = s.level;
      }
    }

    // Exclude task owner
    const candidateIds = Object.keys(skillMap).filter((id) => id !== String(req.user.id));
    if (!candidateIds.length) return res.json({ candidates: [], taskSkill: task.skillRequired });

    const users = await User.find({ _id: { $in: candidateIds } });

    // Determine which candidates are busy (have a Pending or Accepted match)
    const activeMatches = await Match.find({
      helper: { $in: candidateIds },
      status: { $in: ["Pending", "Accepted"] },
    });
    const busySet = new Set(activeMatches.map((m) => m.helper.toString()));

    // Determine which already have a request for THIS task
    const existing = await Match.find({ task: task._id, status: { $in: ["Pending", "Accepted"] } });
    const requestedSet = new Set(existing.map((m) => m.helper.toString()));

    const candidates = users.map((user) => {
      const skillLevel = skillMap[user._id.toString()];
      const score = computeScore(user, skillLevel, task);
      return {
        user: {
          _id: user._id,
          fullName: user.fullName,
          studentId: user.studentId,
          reputation: user.reputation,
          completedTasksCount: user.completedTasksCount,
          lastActive: user.lastActive,
        },
        skillLevel,
        score,
        isAvailable: !busySet.has(user._id.toString()),
        hasRequest: requestedSet.has(user._id.toString()),
      };
    });

    // Sort: available first, then by score descending
    candidates.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return b.score - a.score;
    });

    return res.json({ candidates, taskSkill: task.skillRequired });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/match/request ───────────────────────────────────────────────────
// Task owner sends a match request to a specific candidate
export const createMatchRequest = async (req, res) => {
  try {
    const { taskId, helperId } = req.body;
    if (!taskId || !helperId) {
      return res.status(400).json({ message: "taskId and helperId are required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (String(task.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the task owner can send match requests" });
    }
    if (task.status !== "OPEN") {
      return res.status(400).json({ message: "Task is not open" });
    }
    if (String(helperId) === String(req.user.id)) {
      return res.status(400).json({ message: "Cannot match yourself" });
    }

    const helper = await User.findById(helperId);
    if (!helper) return res.status(404).json({ message: "Candidate not found" });

    // No duplicate pending request
    const dup = await Match.findOne({ task: taskId, helper: helperId, status: "Pending" });
    if (dup) return res.status(409).json({ message: "Match request already sent to this user" });

    // Check candidate availability
    const activeMatcher = await Match.findOne({
      helper: helperId,
      status: { $in: ["Pending", "Accepted"] },
    });
    if (activeMatcher) {
      return res.status(400).json({ message: "This user is currently busy with another task" });
    }

    // Compute score
    const pattern = new RegExp(escapeRegex(task.skillRequired), "i");
    const skillEntry = await Skill.findOne({
      userId: helperId,
      $or: [{ skill: pattern }, { subCategory: pattern }, { category: pattern }],
    });
    const score = computeScore(helper, skillEntry?.level, task);

    const match = await Match.create({
      task: taskId,
      helper: helperId,
      requestedBy: req.user.id,
      score,
    });

    return res.status(201).json({ message: "Match request sent", match });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/match/:matchId/accept ──────────────────────────────────────────
export const acceptMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId).populate("task");
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (String(match.helper) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the matched helper can accept" });
    }
    if (match.status !== "Pending") {
      return res.status(400).json({ message: "Match is no longer pending" });
    }
    if (new Date() > match.expiryTime) {
      match.status = "Timeout";
      await match.save();
      return res.status(400).json({ message: "Match request has expired" });
    }

    const task = match.task;
    if (task.status !== "OPEN") {
      match.status = "Cancelled";
      await match.save();
      return res.status(400).json({ message: "Task is no longer open" });
    }

    // Create session record, carrying venue from task
    const session = await Session.create({
      task: task._id,
      poster: task.createdBy,
      helper: req.user.id,
      mode: task.mode || "Online",
      venue: task.venue || "",
    });

    match.status = "Accepted";
    match.session = session._id;
    await match.save();

    // Update task to MATCHED
    task.status = "MATCHED";
    task.acceptedBy = req.user.id;
    await task.save();

    // Cancel other pending match requests for the same task
    await Match.updateMany(
      { task: task._id, status: "Pending", _id: { $ne: match._id } },
      { $set: { status: "Cancelled" } }
    );

    // Bump helper's lastActive
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });

    return res.json({ message: "Match accepted", match, session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/match/:matchId/decline ─────────────────────────────────────────
export const declineMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (String(match.helper) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the matched helper can decline" });
    }
    if (match.status !== "Pending") {
      return res.status(400).json({ message: "Match is no longer pending" });
    }

    match.status = "Declined";
    await match.save();

    return res.json({ message: "Match declined", match });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/match/my-requests ───────────────────────────────────────────────
// Pending/recent match requests where current user is the helper
export const getMyMatchRequests = async (req, res) => {
  try {
    const matches = await Match.find({
      helper: req.user.id,
      status: { $in: ["Pending", "Accepted", "Declined"] },
    })
      .populate("task", "title description skillRequired urgency mode duration createdBy")
      .populate("requestedBy", "fullName studentId")
      .sort({ requestTime: -1 });

    return res.json({ matches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/match/my-task-matches ───────────────────────────────────────────
// Match requests sent for the current user's tasks (as task owner)
export const getMyTaskMatches = async (req, res) => {
  try {
    const myTasks = await Task.find({ createdBy: req.user.id }).select("_id");
    const taskIds = myTasks.map((t) => t._id);

    const matches = await Match.find({
      task: { $in: taskIds },
      status: { $in: ["Pending", "Accepted", "Declined", "Cancelled"] },
    })
      .populate("task", "title skillRequired status")
      .populate("helper", "fullName studentId reputation completedTasksCount")
      .sort({ requestTime: -1 });

    return res.json({ matches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/match/session/:taskId ───────────────────────────────────────────
export const getSessionByTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwner = String(task.createdBy) === String(req.user.id);
    const isHelper = task.acceptedBy && String(task.acceptedBy) === String(req.user.id);
    if (!isOwner && !isHelper) return res.status(403).json({ message: "Access denied" });

    const session = await Session.findOne({ task: req.params.taskId })
      .populate("poster", "fullName studentId email")
      .populate("helper", "fullName studentId email reputation completedTasksCount")
      .populate("task", "title description expectedOutcome category urgency skillRequired duration mode deadlineDays createdAt acceptedBy createdBy status venue");

    if (!session) return res.status(404).json({ message: "No session found" });

    return res.json({ session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/match/top-helper/:taskId ────────────────────────────────────────
// Returns the single highest-scoring available candidate for a task (task owner only)
export const getTopHelper = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (String(task.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the task owner can view the top helper" });
    }
    if (task.status !== "OPEN") {
      return res.status(200).json({ topHelper: null });
    }

    const pattern = new RegExp(escapeRegex(task.skillRequired), "i");
    const matchingSkills = await Skill.find({
      $or: [{ skill: pattern }, { subCategory: pattern }, { category: pattern }],
    }).lean();

    if (!matchingSkills.length) return res.status(200).json({ topHelper: null });

    // Build userId → best level map, excluding task owner
    const skillMap = {};
    const levelOrder = ["Beginner", "Intermediate", "Expert"];
    for (const s of matchingSkills) {
      const uid = String(s.userId);
      if (uid === String(task.createdBy)) continue;
      const existing = skillMap[uid];
      if (!existing || levelOrder.indexOf(s.level) > levelOrder.indexOf(existing)) {
        skillMap[uid] = s.level;
      }
    }

    const candidateIds = Object.keys(skillMap);
    if (!candidateIds.length) return res.status(200).json({ topHelper: null });

    // Exclude busy candidates
    const activeMatches = await Match.find({
      helper: { $in: candidateIds },
      status: { $in: ["Pending", "Accepted"] },
    }).lean();
    const busySet = new Set(activeMatches.map((m) => String(m.helper)));

    const availableIds = candidateIds.filter((id) => !busySet.has(id));
    const lookupIds = availableIds.length ? availableIds : candidateIds;

    const users = await User.find({ _id: { $in: lookupIds } })
      .select("fullName studentId reputation completedTasksCount lastActive")
      .lean();

    let best = null;
    let bestScore = -1;

    for (const user of users) {
      const level = skillMap[String(user._id)];
      const score = computeScore(user, level, task);
      if (score > bestScore) {
        bestScore = score;
        best = { ...user, level, score };
      }
    }

    return res.status(200).json({ topHelper: best });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/match/my-sessions ────────────────────────────────────────────────
// Returns all sessions where the current user is either the poster or helper
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({
      $or: [{ poster: userId }, { helper: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("poster", "fullName studentId email")
      .populate("helper", "fullName studentId email")
      .populate("task", "title category urgency skillRequired duration mode venue status");

    return res.json({ sessions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── Timeout sweep (called by setInterval) ────────────────────────────────────
export const checkTimeouts = async () => {
  try {
    const now = new Date();
    const result = await Match.updateMany(
      { status: "Pending", expiryTime: { $lt: now } },
      { $set: { status: "Timeout" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Match timeouts processed: ${result.modifiedCount}`);
    }
  } catch (err) {
    console.error("Match timeout check error:", err.message);
  }
};
=======

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
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
