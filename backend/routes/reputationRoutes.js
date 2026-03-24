import express from "express";
import mongoose from "mongoose";
import { 
  getReputation, 
  getUserRatingsWithDetails 
} from "../controllers/reputationController.js";

const router = express.Router();

import { requireAuth } from "../middleware/auth.js";

router.use(requireAuth);

router.get("/:userId", getReputation);
router.get("/ratings/:userId", getUserRatingsWithDetails);

export default router;