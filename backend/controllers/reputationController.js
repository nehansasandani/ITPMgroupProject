import Reputation from "../models/Reputation.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";
import { getReputationInsights, predictFutureScore } from "../utils/reputationAI.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

function getDateThreshold(period) {
  const now = new Date();
  if (period === "weekly")  { now.setDate(now.getDate() - 7);  return now; }
  if (period === "monthly") { now.setDate(now.getDate() - 30); return now; }
  return null; // "all" — no date filter
}

// ─── GET /api/reputation/:userId ─────────────────────────────────────────────

export const getReputation = async (req, res) => {
  try {
    const reputation = await Reputation.findOne({ 
      userId: req.params.userId 
    });

    if (!reputation) {
      return res.status(200).json({
        score: 50,
        noShowCount: 0,
        cooldownUntil: null,
        badges: [],
        categoryScores: [],
      });
    }

    res.status(200).json(reputation);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reputation", error: error.message });
  }
};

// ─── GET /api/reputation/ratings/:userId ─────────────────────────────────────

export const getUserRatingsWithDetails = async (req, res) => {
  try {
    const ratings = await Rating.find({ 
      ratedUserId: req.params.userId 
    }).sort({ createdAt: -1 });

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ratings", error: error.message });
  }
};

// ─── GET /api/reputation/leaderboard ─────────────────────────────────────────
// Query params:
//   period     = "all" | "weekly" | "monthly"   (default: "all")
//   skill      = e.g. "React"                    (optional)
//   department = e.g. "Computer Science"         (optional)

export const getLeaderboard = async (req, res) => {
  try {
    const { period = "all", skill, department } = req.query;
    const dateThreshold = getDateThreshold(period);
    const needsAggregation = !!(dateThreshold || skill);

    let leaderboardData = [];

    if (needsAggregation) {
      // ── Period or skill filter: recompute scores live from Rating collection ──

      // 1. Build match stage
      const match = {};
      if (dateThreshold) match.createdAt = { $gte: dateThreshold };
      if (skill)         match.skillName  = skill;

      // 2. Aggregate average score per user for that window
      const aggregated = await Rating.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$ratedUserId",
            score: {
              $avg: { $avg: ["$clarity", "$effort", "$timeCommitment", "$communication"] }
            },
            ratingCount: { $sum: 1 },
          },
        },
        { $sort: { score: -1 } },
        { $limit: department ? 200 : 50 }, // fetch more if we'll department-filter afterwards
      ]);

      if (aggregated.length === 0) return res.status(200).json([]);

      // 3. Fetch user + reputation docs for the aggregated IDs
      const userIds = aggregated.map(a => a._id);

      const [users, reputations] = await Promise.all([
        User.find({ _id: { $in: userIds } })
            .select("fullName studentId profilePic department role")
            .lean(),
        Reputation.find({ userId: { $in: userIds } })
                  .select("userId badges noShowCount")
                  .lean(),
      ]);

      const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
      const repMap  = Object.fromEntries(reputations.map(r => [r.userId.toString(), r]));

      // 4. Merge, filter orphans, apply optional department filter
      leaderboardData = aggregated
        .map(a => {
          const uid  = a._id.toString();
          const user = userMap[uid];
          if (!user) return null; // orphan — user deleted
          return {
            _id:         uid,
            userId:      user,
            score:       Math.round(a.score * 10) / 10,
            badges:      repMap[uid]?.badges      ?? [],
            noShowCount: repMap[uid]?.noShowCount ?? 0,
            ratingCount: a.ratingCount,
          };
        })
        .filter(Boolean)
        .filter(entry => !department || entry.userId?.department === department)
        .slice(0, 50);

    } else {
      // ── All-time, no skill filter: use stored Reputation.score (fast path) ──

      const reputations = await Reputation.find()
        .sort({ score: -1, "userId.fullName": 1 })
        .limit(department ? 200 : 50) // fetch more if we'll department-filter
        .populate("userId", "fullName studentId profilePic department role")
        .lean();

      leaderboardData = reputations
        .filter(r => r.userId != null) // guard against deleted users
        .filter(r => !department || r.userId?.department === department)
        .slice(0, 50)
        .map(r => ({
          _id:         r._id,
          userId:      r.userId,
          score:       r.score,
          badges:      r.badges      ?? [],
          noShowCount: r.noShowCount ?? 0,
        }));
    }

    res.status(200).json(leaderboardData);

  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
};

// ─── GET /api/reputation/:userId/history ─────────────────────────────────────
// Get reputation change history (timeline/audit log) for a user
export const getReputationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Import ReputationLog here to avoid circular dependency
    const ReputationLog = (await import('../models/ReputationLog.js')).default;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Fetch reputation logs
    const logs = await ReputationLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ReputationLog.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        total,
        logs,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching reputation history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/reputation/:userId/log ─────────────────────────────────────────
// Create a reputation log entry (called internally by other modules)
export const createReputationLog = async (userId, reason, newScore, oldScore, relatedId = null, details = {}) => {
  try {
    const ReputationLog = (await import('../models/ReputationLog.js')).default;

    const delta = newScore - oldScore;

    const log = new ReputationLog({
      userId,
      oldScore,
      newScore,
      delta,
      reason,
      relatedId,
      details,
      createdAt: new Date(),
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating reputation log:', error);
    return null;
  }
};

// ─── GET /api/reputation/:userId/insights ─────────────────────────────────────
// AI-powered reputation insights: explanation, suggestions, anomalies
export const getReputationInsightsHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate insights
    const insights = await getReputationInsights(userId);

    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating reputation insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/reputation/:userId/predict ──────────────────────────────────────
// Predict future reputation score based on current trend
export const predictReputationScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const { daysAhead = 7 } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate prediction
    const prediction = await predictFutureScore(userId, parseInt(daysAhead));

    res.status(200).json(prediction);
  } catch (error) {
    console.error('Error predicting reputation score:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── PATCH /api/reputation/:userId/visibility ──────────────────────────────────
// Update user's score visibility preference
export const updateScoreVisibility = async (req, res) => {
  try {
    const { userId } = req.params;
    const { visibility } = req.body;

    // Validate visibility value
    if (!['public', 'tier_only', 'private'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        error: "Invalid visibility. Must be 'public', 'tier_only', or 'private'",
      });
    }

    // Verify user is updating their own profile (or admin)
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own score visibility',
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { scoreVisibility: visibility },
      { new: true }
    ).select('fullName scoreVisibility');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        scoreVisibility: user.scoreVisibility,
        message: 'Score visibility updated successfully',
      },
    });
  } catch (error) {
    console.error('Error updating score visibility:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/reputation/:userId/settings ──────────────────────────────────────
// Get reputation settings for a user
export const getReputationSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('scoreVisibility');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        scoreVisibility: user.scoreVisibility,
      },
    });
  } catch (error) {
    console.error('Error fetching reputation settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};