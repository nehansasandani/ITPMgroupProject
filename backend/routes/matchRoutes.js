import express from "express";
import {
  getRankedCandidates,
  getTopHelper,
  createMatchRequest,
  acceptMatch,
  declineMatch,
  getMyMatchRequests,
  getMyTaskMatches,
  getSessionByTask,
  getMySessions,
} from "../controllers/matchController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/candidates/:taskId", requireAuth, getRankedCandidates);
router.get("/top-helper/:taskId", requireAuth, getTopHelper);
router.post("/request", requireAuth, createMatchRequest);
router.post("/:matchId/accept", requireAuth, acceptMatch);
router.post("/:matchId/decline", requireAuth, declineMatch);
router.get("/my-requests", requireAuth, getMyMatchRequests);
router.get("/my-task-matches", requireAuth, getMyTaskMatches);
router.get("/session/:taskId", requireAuth, getSessionByTask);
router.get("/my-sessions", requireAuth, getMySessions);

export default router;