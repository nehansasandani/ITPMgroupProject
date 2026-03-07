import express from "express";
import mongoose from "mongoose";
import { submitRating, getUserRatings } from "../controllers/ratingController.js";

const router = express.Router();

// MOCK AUTH - fixed
const mockAuth = (req, res, next) => {
  req.userId = new mongoose.Types.ObjectId("64f832b1f1234567890abcde"); // ← this line
  next();
};

router.use(mockAuth);

router.post("/", submitRating);
router.get("/:userId", getUserRatings);

export default router;