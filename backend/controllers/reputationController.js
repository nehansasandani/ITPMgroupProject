import Reputation from "../models/Reputation.js";
import Rating from "../models/Rating.js";

// GET /api/reputation/:userId
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

// GET /api/reputation/ratings/:userId
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