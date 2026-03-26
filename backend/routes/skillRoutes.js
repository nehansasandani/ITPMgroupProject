import express from "express";
import { getMySkills, addSkill, removeSkill, getQuizForSkill, submitQuiz } from "../controllers/skillController.js";

const router = express.Router();

import { requireAuth } from "../middleware/auth.js";

router.use(requireAuth);

router.get("/", getMySkills);
router.post("/", addSkill);
router.get("/quiz/:skillName", getQuizForSkill);
router.post("/quiz/submit", submitQuiz);
router.delete("/:id", removeSkill);

export default router;
