import express from "express";
import { 
  getReputation, 
  getUserRatingsWithDetails,
  getLeaderboard,
  getReputationHistory,
  getReputationSettings,
  updateScoreVisibility,
  getReputationInsightsHandler,
  predictReputationScore,
} from "../controllers/reputationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/leaderboard", getLeaderboard);           // must be before /:userId
router.get("/:userId/insights", getReputationInsightsHandler);  // AI insights
router.get("/:userId/predict", predictReputationScore);         // Score prediction
router.get("/:userId/history", getReputationHistory);
router.get("/:userId/settings", getReputationSettings);
router.patch("/:userId/visibility", updateScoreVisibility);
router.get("/ratings/:userId", getUserRatingsWithDetails);
router.get("/:userId", getReputation);

export default router;