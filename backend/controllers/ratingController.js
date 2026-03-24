import Rating from "../models/Rating.js";
import Reputation from "../models/Reputation.js";
import Skill from "../models/Skill.js"; // her model

// ─── Helper: recalculate full reputation after new rating ─────────────────────
const updateReputationScore = async (userId) => {
  const ratings = await Rating.find({ ratedUserId: userId });
  if (ratings.length === 0) return;

  // 1. Dynamic Score Engine (Plus/Minus & Time Decay)
  let sumMarks = 0;
  const now = Date.now();

  ratings.forEach(r => {
    const avg = (r.clarity + r.effort + r.timeCommitment + r.communication) / 4;
    
    // Delta from standard base 3.0. A 5-star avg = +2, a 1-star avg = -2
    const delta = avg - 3.0;
    
    // Convert to plus/minus marks. (E.g. max +10 or -10 points per rating)
    const points = delta * 5; 
    
    // Time decay: 30-day half-life so older mistakes naturally fade
    const ageDays = (now - new Date(r.createdAt || now).getTime()) / (1000 * 60 * 60 * 24);
    const weight = Math.exp(-ageDays / 30);
    
    sumMarks += points * weight;
  });

  const rawScore = 50 + sumMarks;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

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

  // 3. Auto assign dynamic badges
  const badges = [];
  if (score >= 85) badges.push("Top Contributor");
  if (score >= 70 && score < 85) badges.push("Reliable");
  if (score <= 40) badges.push("Needs Improvement");

  const commScores = ratings.map((r) => r.communication);
  if (avg(commScores) >= 4.5 && ratings.length >= 3) badges.push("Top Communicator");
  
  const timeScores = ratings.map((r) => r.timeCommitment);
  if (avg(timeScores) >= 4.5 && ratings.length >= 3) badges.push("Punctual");

  // 4. Save
  await Reputation.findOneAndUpdate(
    { userId },
    { score, categoryScores, badges, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
};

// ─── POST /api/ratings ────────────────────────────────────────────────────────
const BAD_WORDS = ["idiot", "stupid", "dumb", "lazy", "terrible", "fake", "scam", "trash", "sucks"];

export const submitRating = async (req, res) => {
  try {
    const {
      sessionId, ratedUserId,
      skillCategory, skillSubCategory, skillName,
      clarity, effort, timeCommitment, communication,
      comment,
    } = req.body;

    // Reject bad words natively
    if (comment && BAD_WORDS.some(w => comment.toLowerCase().includes(w))) {
      return res.status(400).json({ message: "Inappropriate language restricted automatically." });
    }

    const raterId = req.user.id;

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