import express from "express";
import { createTask, getMyTasks } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, createTask);
router.get("/mine", requireAuth, getMyTasks);

export default router;