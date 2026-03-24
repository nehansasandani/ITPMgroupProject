import express from "express";
import mongoose from "mongoose";
import { getMySkills, addSkill, removeSkill } from "../controllers/skillController.js";

const router = express.Router();

import { requireAuth } from "../middleware/auth.js";

router.use(requireAuth);

router.get("/", getMySkills);
router.post("/", addSkill);
router.delete("/:id", removeSkill);

export default router;
