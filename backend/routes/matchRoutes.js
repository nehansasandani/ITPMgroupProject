import express from "express";
import { createMatch, acceptMatch } from "../controllers/matchController.js";

const router = express.Router();

router.post("/create", createMatch);
router.post("/accept", acceptMatch);

export default router;