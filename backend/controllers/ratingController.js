import Rating from "../models/Rating.js";

export const submitRating = async (req, res) => {
  try {
    const { sessionId, ratedUserId, clarity, effort, timeCommitment, communication } = req.body;
    const raterId = req.userId;

    const rating = await Rating.create({
      sessionId, raterId, ratedUserId,
      clarity, effort, timeCommitment, communication,
    });

    res.status(201).json({ message: "Rating submitted ✅", rating });
  } catch (error) {
    res.status(500).json({ message: "Error submitting rating", error: error.message });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUserId: req.params.userId });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ratings", error: error.message });
  }
};