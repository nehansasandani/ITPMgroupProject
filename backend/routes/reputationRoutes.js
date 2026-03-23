import express from "express";
import mongoose from "mongoose";
import { 
  getReputation, 
  getUserRatingsWithDetails 
} from "../controllers/reputationController.js";

const router = express.Router();

// Mock auth
const mockAuth = (req, res, next) => {
  req.userId = new mongoose.Types.ObjectId("64f832b1f1234567890abcde");
  next();
};

router.use(mockAuth);

router.get("/:userId", getReputation);
router.get("/ratings/:userId", getUserRatingsWithDetails);

export default router;