import express from "express";
import mongoose from "mongoose";
import { getMySkills, addSkill, removeSkill } from "../controllers/skillController.js";

const router = express.Router();

// MOCK AUTH (Fixed)
const mockAuth = (req, res, next) => {
  req.userId = new mongoose.Types.ObjectId("64f832b1f1234567890abcde");
  next();
};

router.use(mockAuth);

router.get("/", getMySkills);
router.post("/", addSkill);
router.delete("/:id", removeSkill);

export default router;
