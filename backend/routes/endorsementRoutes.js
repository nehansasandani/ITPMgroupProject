import express from 'express';
import {
  submitEndorsement,
  getEndorsements,
  getEndorsementsBySkill,
  getEndorsementSummary,
} from '../controllers/endorsementController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All endorsement routes require authentication
router.use(requireAuth);

/**
 * POST /api/endorsements
 * Submit a new endorsement
 */
router.post('/', submitEndorsement);

/**
 * GET /api/endorsements/:userId
 * Get all endorsements for a user (grouped by skill)
 */
router.get('/:userId', getEndorsements);

/**
 * GET /api/endorsements/:userId/summary
 * Get endorsement count summary by skill
 */
router.get('/:userId/summary', getEndorsementSummary);

/**
 * GET /api/endorsements/:userId/skill/:skill
 * Get endorsements for a specific skill
 */
router.get('/:userId/skill/:skill', getEndorsementsBySkill);

export default router;
