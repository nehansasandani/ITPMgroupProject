import Rating from '../models/Rating.js';
import Endorsement from '../models/Endorsement.js';
import Session from '../models/Session.js';

/**
 * Calculate average rating for a user
 * Factors: clarity, effort, timeliness (each 0-5)
 * Returns: average rating (0-5) and detailed breakdown
 */
async function getAverageRating(userId) {
  try {
    const ratings = await Rating.find({ rateeId: userId });
    if (ratings.length === 0) {
      return { avgRating: 0, count: 0, breakdown: { clarity: 0, effort: 0, timeliness: 0 } };
    }

    const breakdown = {
      clarity: ratings.reduce((sum, r) => sum + (r.clarity || 0), 0) / ratings.length,
      effort: ratings.reduce((sum, r) => sum + (r.effort || 0), 0) / ratings.length,
      timeliness: ratings.reduce((sum, r) => sum + (r.timeliness || 0), 0) / ratings.length,
    };

    const avgRating = (breakdown.clarity + breakdown.effort + breakdown.timeliness) / 3;

    return { avgRating, count: ratings.length, breakdown };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { avgRating: 0, count: 0, breakdown: { clarity: 0, effort: 0, timeliness: 0 } };
  }
}

/**
 * Calculate completion rate for a user
 * Returns: completion rate (0-1) and session counts
 */
async function getCompletionRate(userId) {
  try {
    const sessions = await Session.find({
      $or: [{ helperId: userId }, { requesterId: userId }],
    });

    if (sessions.length === 0) {
      return { completionRate: 0, completed: 0, total: 0 };
    }

    const completed = sessions.filter(s => s.status === 'completed').length;
    const completionRate = completed / sessions.length;

    return { completionRate, completed, total: sessions.length };
  } catch (error) {
    console.error('Error calculating completion rate:', error);
    return { completionRate: 0, completed: 0, total: 0 };
  }
}

/**
 * Calculate recency factor (0-1)
 * More recent activity = higher factor
 * Decays over 90 days
 */
function getRecencyFactor(lastActivityDate) {
  if (!lastActivityDate) return 0;

  const now = new Date();
  const daysSinceActivity = (now - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24);

  if (daysSinceActivity < 7) return 1; // Within 7 days: full score
  if (daysSinceActivity < 30) return 0.8; // 7-30 days: 80%
  if (daysSinceActivity < 60) return 0.5; // 30-60 days: 50%
  if (daysSinceActivity < 90) return 0.2; // 60-90 days: 20%
  return 0; // Beyond 90 days: 0
}

/**
 * Calculate endorsement score (0-1)
 * Based on number of unique skill endorsements
 * Normalized to max 20 endorsements = 1.0
 */
async function getEndorsementScore(userId) {
  try {
    const endorsements = await Endorsement.find({ endorseeId: userId });

    if (endorsements.length === 0) {
      return { endorsementScore: 0, totalEndorsements: 0, skillsEndorsed: 0 };
    }

    const uniqueSkills = new Set(endorsements.map(e => e.skill)).size;
    const totalCount = endorsements.length;

    // Normalize: every 2 endorsements = +0.05 (max 20 endorsements = 1.0)
    const endorsementScore = Math.min(1, totalCount / 20);

    return { endorsementScore, totalEndorsements: totalCount, skillsEndorsed: uniqueSkills };
  } catch (error) {
    console.error('Error calculating endorsement score:', error);
    return { endorsementScore: 0, totalEndorsements: 0, skillsEndorsed: 0 };
  }
}

/**
 * Main reputation calculation function
 * Formula: score = (0.4 × avgRating) + (0.3 × completionRate) + (0.2 × recencyFactor) + (0.05 × endorsementScore) − (0.1 × penaltyScore)
 * Result: 0-100
 */
export async function calculateReputation(userId, penaltyScore = 0) {
  try {
    const [ratingData, completionData, endorsementData] = await Promise.all([
      getAverageRating(userId),
      getCompletionRate(userId),
      getEndorsementScore(userId),
    ]);

    // Get most recent session for recency
    const recentSession = await Session.findOne(
      { $or: [{ helperId: userId }, { requesterId: userId }] },
      {},
      { sort: { createdAt: -1 } }
    );

    const recencyFactor = getRecencyFactor(recentSession?.createdAt);

    // Normalize ratings from 0-5 scale to 0-1 scale
    const normalizedRating = ratingData.avgRating / 5;

    // Calculate final score (0-100)
    const reputationScore =
      (0.4 * normalizedRating * 100) +
      (0.3 * completionData.completionRate * 100) +
      (0.2 * recencyFactor * 100) +
      (0.05 * endorsementData.endorsementScore * 100) -
      (0.1 * penaltyScore * 100);

    // Clamp to 0-100
    const finalScore = Math.max(0, Math.min(100, reputationScore));

    return {
      score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
      components: {
        rating: { value: normalizedRating * 100, weight: 0.4, raw: ratingData },
        completionRate: { value: completionData.completionRate * 100, weight: 0.3, raw: completionData },
        recency: { value: recencyFactor * 100, weight: 0.2 },
        endorsements: { value: endorsementData.endorsementScore * 100, weight: 0.05, raw: endorsementData },
        penalty: { value: -penaltyScore * 100, weight: 0.1 },
      },
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error calculating reputation:', error);
    return {
      score: 0,
      components: {},
      error: error.message,
    };
  }
}

/**
 * Calculate tier based on reputation score
 * Bronze: 0-29, Silver: 30-49, Gold: 50-69, Platinum: 70-89, Elite: 90+
 */
export function getTier(score) {
  if (score >= 90) return 'Elite';
  if (score >= 70) return 'Platinum';
  if (score >= 50) return 'Gold';
  if (score >= 30) return 'Silver';
  return 'Bronze';
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier) {
  const colors = {
    Elite: '#ff00ff', // Magenta
    Platinum: '#60a5fa', // Blue
    Gold: '#fbbf24', // Amber
    Silver: '#d1d5db', // Gray
    Bronze: '#d97706', // Orange
  };
  return colors[tier] || '#9ca3af';
}

export { getAverageRating, getCompletionRate, getRecencyFactor, getEndorsementScore };
