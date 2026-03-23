import express from "express";
import mongoose from "mongoose";
import {
  submitRating,
  getUserRatings,
  getUserSkillCategories,
} from "../controllers/ratingController.js";

const router = express.Router();

// MOCK AUTH — replace with: import { requireAuth } from "../middleware/auth.js"
const mockAuth = (req, res, next) => {
  req.userId = new mongoose.Types.ObjectId("64f832b1f1234567890abcde");
  next();
};

router.use(mockAuth);

router.post("/", submitRating);
router.get("/:userId", getUserRatings);
router.get("/skills/:userId", getUserSkillCategories);

export default router;