import express from "express";
<<<<<<< HEAD
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
=======
import { createMatch, acceptMatch } from "../controllers/matchController.js";

const router = express.Router();

router.post("/create", createMatch);
router.post("/accept", acceptMatch);
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

export default router;