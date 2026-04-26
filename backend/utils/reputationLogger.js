import { createReputationLog } from '../controllers/reputationController.js';

/**
 * Log a reputation change
 * Called by other modules when reputation-affecting events occur
 *
 * @param {string} userId - User ID
 * @param {number} oldScore - Previous reputation score
 * @param {number} newScore - New reputation score
 * @param {string} reason - Reason for change (enum)
 * @param {ObjectId} relatedId - ID of related entity (rating, session, etc.)
 * @param {object} details - Additional context
 * @returns {Promise<object>} - Created log object
 */
export async function logReputationChange(userId, oldScore, newScore, reason, relatedId = null, details = {}) {
  return await createReputationLog(userId, reason, newScore, oldScore, relatedId, details);
}

/**
 * Helper to log rating received
 */
export async function logRatingReceived(userId, oldScore, newScore, ratingId, skillName) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'rating_received',
    ratingId,
    { skill: skillName }
  );
}

/**
 * Helper to log session completed
 */
export async function logSessionCompleted(userId, oldScore, newScore, sessionId) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'session_completed',
    sessionId,
    {}
  );
}

/**
 * Helper to log session no-show
 */
export async function logSessionNoShow(userId, oldScore, newScore, sessionId) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'session_noshow',
    sessionId,
    {}
  );
}

/**
 * Helper to log endorsement received
 */
export async function logEndorsementReceived(userId, oldScore, newScore, endorsementId, skill) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'endorsement_received',
    endorsementId,
    { skill }
  );
}

/**
 * Helper to log badge earned
 */
export async function logBadgeEarned(userId, oldScore, newScore, badgeName) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'badge_earned',
    null,
    { badge: badgeName }
  );
}

/**
 * Helper to log penalty applied
 */
export async function logPenaltyApplied(userId, oldScore, newScore, reason, details = {}) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'penalty_applied',
    null,
    { reason, ...details }
  );
}

/**
 * Helper to log dispute opened
 */
export async function logDisputeOpened(userId, oldScore, newScore, disputeId) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'dispute_opened',
    disputeId,
    { action: 'score_frozen' }
  );
}

/**
 * Helper to log dispute resolved
 */
export async function logDisputeResolved(userId, oldScore, newScore, disputeId, details = {}) {
  return logReputationChange(
    userId,
    oldScore,
    newScore,
    'dispute_resolved',
    disputeId,
    { action: 'score_unfrozen', ...details }
  );
}
