import ReputationLog from '../models/ReputationLog.js';
import Rating from '../models/Rating.js';
import Endorsement from '../models/Endorsement.js';
import Reputation from '../models/Reputation.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================
 * Reputation AI Insights System
 * ============================================================
 * Analyzes reputation changes, generates insights, and provides
 * actionable suggestions using both rule-based logic and AI.
 */

// ─── AI Helper: Call Groq/LLM for Natural Explanation ─────────
const callAI = async (prompt) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not configured, falling back to rule-based analysis');
      return null;
    }

    // Create fresh Groq instance with current API key
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error calling AI:', error.message);
    return null; // Fallback to rule-based
  }
};

// ─── Helper: Calculate Stats ──────────────────────────────────
const getReputationStats = async (userId) => {
  try {
    const [reputation, ratings, endorsements, logs] = await Promise.all([
      Reputation.findOne({ userId }),
      Rating.find({ ratedUserId: userId }),
      Endorsement.find({ endorseeId: userId }),
      ReputationLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + (r.clarity + r.effort + r.timeCommitment + r.communication) / 4, 0) / ratings.length).toFixed(2)
      : 0;

    const recentNoShows = logs.filter(l => l.reason === 'session_noshow').length;
    const recentEndorsements = logs.filter(l => l.reason === 'endorsement_received').length;
    const recentRatings = logs.filter(l => l.reason === 'rating_received').length;

    return {
      score: reputation?.score || 50,
      tier: getTierFromScore(reputation?.score || 50),
      avgRating: parseFloat(avgRating),
      totalRatings: ratings.length,
      endorsementCount: endorsements.length,
      endorsementsBySkill: groupBySkill(endorsements),
      noShowCount: reputation?.noShowCount || 0,
      badges: reputation?.badges || [],
      recentNoShows,
      recentEndorsements,
      recentRatings,
      recentLogs: logs,
    };
  } catch (error) {
    console.error('Error calculating reputation stats:', error);
    return null;
  }
};

// ─── Helper: Group Endorsements by Skill ──────────────────────
const groupBySkill = (endorsements) => {
  const grouped = {};
  endorsements.forEach(e => {
    if (!grouped[e.skill]) grouped[e.skill] = 0;
    grouped[e.skill]++;
  });
  return grouped;
};

// ─── Helper: Get Tier from Score ──────────────────────────────
const getTierFromScore = (score) => {
  if (score >= 90) return 'Elite';
  if (score >= 70) return 'Platinum';
  if (score >= 50) return 'Gold';
  if (score >= 30) return 'Silver';
  return 'Bronze';
};

// ─── Helper: Get Next Tier Score ──────────────────────────────
const getNextTierThreshold = (currentScore) => {
  if (currentScore < 30) return 30; // Bronze → Silver
  if (currentScore < 50) return 50; // Silver → Gold
  if (currentScore < 70) return 70; // Gold → Platinum
  if (currentScore < 90) return 90; // Platinum → Elite
  return 100; // Already Elite
};

// ─── Rule-Based: Generate Score Explanation ───────────────────
const generateScoreExplanation = (stats) => {
  const recentLog = stats.recentLogs[0];
  if (!recentLog) return [];

  const reasons = [];
  const delta = recentLog.delta;

  // Positive changes
  if (delta > 0) {
    if (recentLog.reason === 'rating_received') {
      reasons.push(`✔ You received a high rating (${stats.avgRating}/5 average)`);
    }
    if (recentLog.reason === 'endorsement_received') {
      reasons.push(`✔ You gained a ${recentLog.details?.skill} endorsement from a peer`);
    }
    if (recentLog.reason === 'badge_earned') {
      reasons.push(`✔ You earned the "${recentLog.details?.badgeName}" badge`);
    }
    if (recentLog.reason === 'session_completed') {
      reasons.push(`✔ You completed a session successfully and on time`);
    }
  }

  // Negative changes
  if (delta < 0) {
    if (recentLog.reason === 'session_noshow') {
      reasons.push(`⚠ You missed a session (no-show penalty)`);
    }
    if (recentLog.reason === 'penalty_applied') {
      reasons.push(`⚠ A penalty was applied (${recentLog.details?.reason || 'violation'})`);
    }
    if (recentLog.reason === 'dispute_resolved') {
      reasons.push(`⚠ A dispute was resolved against you`);
    }
  }

  // Add context about performance
  if (stats.noShowCount > 0) {
    reasons.push(`⚠ You have ${stats.noShowCount} no-show(s), which impacts credibility`);
  }

  if (stats.avgRating > 4.5 && stats.totalRatings >= 3) {
    reasons.push(`✔ You have consistently high ratings (${stats.avgRating}/5)`);
  }

  if (stats.endorsementCount >= 5) {
    reasons.push(`✔ You've earned ${stats.endorsementCount} peer endorsements`);
  }

  return reasons;
};

// ─── Rule-Based: Generate Improvement Suggestions ───────────────
const generateSuggestions = (stats) => {
  const suggestions = [];
  const nextTierThreshold = getNextTierThreshold(stats.score);
  const pointsToNextTier = nextTierThreshold - stats.score;

  // Generic tier-up advice
  if (stats.score < 90) {
    suggestions.push(`To reach ${getTierFromScore(nextTierThreshold)} tier: gain ${pointsToNextTier} points`);
  }

  // Rating-based suggestions
  if (stats.avgRating < 4.0 && stats.totalRatings > 0) {
    suggestions.push('🎯 Improve communication score in sessions (currently below 4.0)');
  }

  if (stats.totalRatings < 3) {
    suggestions.push('🎯 Complete more sessions to build ratings (need at least 3 for credibility)');
  }

  // Endorsement-based suggestions
  if (stats.endorsementCount < 5) {
    const needed = 5 - stats.endorsementCount;
    suggestions.push(`🎯 Get ${needed} more endorsements to boost reputation (+5% each)`);
  }

  // Skill-specific suggestions
  const skillsWithFewEndorsements = Object.entries(stats.endorsementsBySkill)
    .filter(([_, count]) => count < 3)
    .map(([skill]) => skill);

  if (skillsWithFewEndorsements.length > 0) {
    suggestions.push(`🎯 Gain more endorsements in: ${skillsWithFewEndorsements.slice(0, 3).join(', ')}`);
  }

  // No-show penalty suggestions
  if (stats.noShowCount > 0) {
    suggestions.push('⚠ Avoid no-shows: Be reliable and always show up for sessions');
  }

  return suggestions;
};

// ─── Rule-Based: Detect Anomalies ────────────────────────────
const detectAnomalies = (stats) => {
  const anomalies = [];

  // Sudden endorsement spike
  if (stats.recentEndorsements > 3) {
    anomalies.push({
      type: 'endorsement_spike',
      severity: 'warning',
      message: `Received ${stats.recentEndorsements} endorsements recently. Ensure these are genuine peer recognitions.`,
    });
  }

  // Multiple no-shows
  if (stats.noShowCount >= 2) {
    anomalies.push({
      type: 'multiple_no_shows',
      severity: 'alert',
      message: `${stats.noShowCount} no-shows on record. Repeated no-shows can damage credibility and lead to account restrictions.`,
    });
  }

  // Low rating consistency
  if (stats.avgRating < 2.0 && stats.totalRatings >= 3) {
    anomalies.push({
      type: 'low_ratings',
      severity: 'alert',
      message: 'Your average rating is low. Review feedback from peers to improve performance.',
    });
  }

  // Score drop
  const recentLogs = stats.recentLogs.slice(0, 3);
  const hasNegativeTrend = recentLogs.some(log => log.delta < -2);
  if (hasNegativeTrend) {
    anomalies.push({
      type: 'score_decline',
      severity: 'info',
      message: 'Your score has declined recently. Check the timeline to understand why.',
    });
  }

  return anomalies;
};

// ─── AI-Powered: Generate Natural Explanation ──────────────────
export const generateAIExplanation = async (stats) => {
  try {
    const prompt = `
You are a reputation system advisor. Based on this user's stats, provide a clear, human-like explanation of their reputation score and changes:

User Score: ${stats.score}/100
Current Tier: ${stats.tier}
Average Rating: ${stats.avgRating}/5 (from ${stats.totalRatings} sessions)
Endorsements: ${stats.endorsementCount}
No-Shows: ${stats.noShowCount}
Badges Earned: ${stats.badges.length > 0 ? stats.badges.join(', ') : 'None yet'}

Recent activity:
- Ratings received: ${stats.recentRatings}
- Endorsements received: ${stats.recentEndorsements}
- No-shows: ${stats.recentNoShows}

Generate a brief (2-3 sentences), friendly explanation of:
1. Why their score is what it is
2. What's helping their score
3. What might be hurting it

Format as plain text, not JSON.
`;

    const explanation = await callAI(prompt);
    return explanation || null;
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return null;
  }
};

// ─── AI-Powered: Generate Improvement Plan ────────────────────
export const generateAIImprovementPlan = async (stats) => {
  try {
    const nextTier = getTierFromScore(getNextTierThreshold(stats.score));
    const pointsNeeded = getNextTierThreshold(stats.score) - stats.score;

    const prompt = `
You are a reputation coach. The user currently has:
- Score: ${stats.score}/100 (${stats.tier} tier)
- Next goal: ${nextTier} tier (need ${pointsNeeded} more points)
- Average rating: ${stats.avgRating}/5
- Endorsements: ${stats.endorsementCount}
- Completions: ${stats.totalRatings} sessions

Give 3-4 specific, actionable steps they can take in the NEXT 7 DAYS to improve their reputation.
Make it practical and achievable. Format as a numbered list.
`;

    const plan = await callAI(prompt);
    return plan || null;
  } catch (error) {
    console.error('Error generating AI improvement plan:', error);
    return null;
  }
};

// ─── Main Export: Get All Insights ────────────────────────────
export const getReputationInsights = async (userId) => {
  try {
    const stats = await getReputationStats(userId);

    if (!stats) {
      return {
        success: false,
        error: 'Could not fetch reputation data',
      };
    }

    // Generate all insights in parallel
    const [explanation, improvementPlan, aiExplanation, aiPlan] = await Promise.all([
      Promise.resolve(generateScoreExplanation(stats)),
      Promise.resolve(generateSuggestions(stats)),
      generateAIExplanation(stats),
      generateAIImprovementPlan(stats),
    ]);

    const anomalies = detectAnomalies(stats);

    return {
      success: true,
      data: {
        // Current stats
        score: stats.score,
        tier: stats.tier,
        nextTierThreshold: getNextTierThreshold(stats.score),
        pointsToNextTier: getNextTierThreshold(stats.score) - stats.score,

        // Rule-based insights
        scoreExplanation: explanation,
        suggestions: improvementPlan,

        // AI-powered insights
        aiExplanation,
        aiImprovementPlan: aiPlan,

        // Anomaly detection
        anomalies,

        // Raw stats for frontend
        stats: {
          avgRating: stats.avgRating,
          totalRatings: stats.totalRatings,
          endorsementCount: stats.endorsementCount,
          endorsementsBySkill: stats.endorsementsBySkill,
          noShowCount: stats.noShowCount,
          badges: stats.badges,
        },
      },
    };
  } catch (error) {
    console.error('Error generating reputation insights:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ─── Prediction: Estimate Future Score ───────────────────────
export const predictFutureScore = async (userId, daysAhead = 7) => {
  try {
    const stats = await getReputationStats(userId);

    if (!stats) {
      return { success: false, error: 'Could not fetch reputation data' };
    }

    // Simple prediction: based on recent trend
    const recentLogs = stats.recentLogs.slice(0, 5);
    const avgDailyChange = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.delta, 0) / recentLogs.length
      : 0;

    const predictedScore = Math.max(0, Math.min(100, stats.score + (avgDailyChange * daysAhead)));
    const predictedTier = getTierFromScore(predictedScore);

    return {
      success: true,
      data: {
        currentScore: stats.score,
        currentTier: stats.tier,
        predictedScore: Math.round(predictedScore * 10) / 10,
        predictedTier,
        daysAhead,
        trend: avgDailyChange > 0 ? 'improving' : avgDailyChange < 0 ? 'declining' : 'stable',
      },
    };
  } catch (error) {
    console.error('Error predicting score:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getReputationInsights,
  predictFutureScore,
  generateAIExplanation,
  generateAIImprovementPlan,
  detectAnomalies,
};
