import Rating from "../models/Rating.js";
import Reputation from "../models/Reputation.js";
import Skill from "../models/Skill.js"; // her model

// ─── Helper: recalculate full reputation after new rating ─────────────────────
const updateReputationScore = async (userId) => {
  const ratings = await Rating.find({ ratedUserId: userId });
  if (ratings.length === 0) return;

  // 1. Overall score (0-100)
  const overall =
    ratings.reduce((sum, r) => {
      return sum + (r.clarity + r.effort + r.timeCommitment + r.communication) / 4;
    }, 0) / ratings.length;

  const score = Math.round((overall / 5) * 100);

  // 2. Per category breakdown
  const categoryMap = {};

  ratings.forEach((r) => {
    const key = `${r.skillCategory}__${r.skillSubCategory}__${r.skillName}`;
    if (!categoryMap[key]) {
      categoryMap[key] = {
        category: r.skillCategory,
        subCategory: r.skillSubCategory,
        skillName: r.skillName,
        clarity: [],
        effort: [],
        timeCommitment: [],
        communication: [],
      };
    }
    categoryMap[key].clarity.push(r.clarity);
    categoryMap[key].effort.push(r.effort);
    categoryMap[key].timeCommitment.push(r.timeCommitment);
    categoryMap[key].communication.push(r.communication);
  });

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const categoryScores = Object.values(categoryMap).map((c) => ({
    category: c.category,
    subCategory: c.subCategory,
    skillName: c.skillName,
    avgClarity: parseFloat(avg(c.clarity).toFixed(2)),
    avgEffort: parseFloat(avg(c.effort).toFixed(2)),
    avgTimeCommitment: parseFloat(avg(c.timeCommitment).toFixed(2)),
    avgCommunication: parseFloat(avg(c.communication).toFixed(2)),
    overallAvg: parseFloat(
      avg([...c.clarity, ...c.effort, ...c.timeCommitment, ...c.communication]).toFixed(2)
    ),
    ratingCount: c.clarity.length,
  }));

  // 3. Auto assign badges
  const badges = [];
  if (score >= 80) badges.push("Top Contributor");
  if (score >= 70) badges.push("Reliable");
  const commScores = ratings.map((r) => r.communication);
  if (avg(commScores) >= 4.5) badges.push("Top Communicator");
  const timeScores = ratings.map((r) => r.timeCommitment);
  if (avg(timeScores) >= 4.5) badges.push("Punctual");

  // 4. Save
  await Reputation.findOneAndUpdate(
    { userId },
    { score, categoryScores, badges, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
};

// ─── POST /api/ratings ────────────────────────────────────────────────────────
export const submitRating = async (req, res) => {
  try {
    const {
      sessionId, ratedUserId,
      skillCategory, skillSubCategory, skillName,
      clarity, effort, timeCommitment, communication,
      comment,
    } = req.body;

    const raterId = req.userId; // from mockAuth (replace with req.user.id when JWT ready)

    const rating = await Rating.create({
      sessionId, raterId, ratedUserId,
      skillCategory, skillSubCategory, skillName,
      clarity, effort, timeCommitment, communication,
      comment: comment || "",
    });

    // Auto update reputation immediately
    await updateReputationScore(ratedUserId);

    res.status(201).json({ message: "Rating submitted ✅", rating });
  } catch (error) {
    res.status(500).json({ message: "Error submitting rating", error: error.message });
  }
};

// ─── GET /api/ratings/:userId ─────────────────────────────────────────────────
export const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUserId: req.params.userId })
      .sort({ createdAt: -1 });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ratings", error: error.message });
  }
};

// ─── GET /api/ratings/skills/:userId (get rated user's skill categories) ──────
export const getUserSkillCategories = async (req, res) => {
  try {
    // Fetch from HER Skill collection
    const skills = await Skill.find({ userId: req.params.userId });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching skills", error: error.message });
  }
};