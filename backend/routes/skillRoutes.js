import express from "express";
<<<<<<< HEAD
import { getMySkills, addSkill, removeSkill } from "../controllers/skillController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
=======
import mongoose from "mongoose";
import { getMySkills, addSkill, removeSkill } from "../controllers/skillController.js";

const router = express.Router();

// MOCK AUTH (Fixed)
const mockAuth = (req, res, next) => {
  req.userId = new mongoose.Types.ObjectId("64f832b1f1234567890abcde");
  next();
};

router.use(mockAuth);
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

router.get("/", getMySkills);
router.post("/", addSkill);
router.delete("/:id", removeSkill);

export default router;
