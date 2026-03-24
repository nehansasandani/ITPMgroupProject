import express from "express";
import mongoose from "mongoose";
import {
  submitRating,
  getUserRatings,
  getUserSkillCategories,
} from "../controllers/ratingController.js";

const router = express.Router();

import { requireAuth } from "../middleware/auth.js";

router.use(requireAuth);

router.post("/", submitRating);
router.get("/:userId", getUserRatings);
router.get("/skills/:userId", getUserSkillCategories);

export default router;