import express from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:sessionId", requireAuth, getMessages);
router.post("/:sessionId", requireAuth, sendMessage);

export default router;
