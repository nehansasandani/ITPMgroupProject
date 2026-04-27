import ReputationLog from '../models/ReputationLog.js';
import Rating from '../models/Rating.js';
import Endorsement from '../models/Endorsement.js';
import Reputation from '../models/Reputation.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import {
  analyzeUserReputation,
  predictReputation,
  benchmarkAgainstPeers,
} from './reputationAIEngine.js';

dotenv.config();

// ─── Singleton Groq client ────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const callAI = async (prompt) => {
  try {
    if (!groq) return null;
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are ARIS — an advanced AI Reputation Analyst. Be concise, professional, and specific. Never use generic filler phrases.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('ARIS AI Layer Error:', error.message);
    return null;
  }
};

// ─── Tier Helpers ─────────────────────────────────────────────
const getTierFromScore = (score) => {
  if (score >= 90) return 'Elite';
  if (score >= 70) return 'Platinum';
  if (score >= 50) return 'Gold';
  if (score >= 30) return 'Silver';
  return 'Bronze';
};

const getNextTierThreshold = (score) => {
  if (score < 30) return 30;
  if (score < 50) return 50;
  if (score < 70) return 70;
  if (score < 90) return 90;
  return 100;
};

// ─── Data Aggregation Layer ───────────────────────────────────
const getReputationStats = async (userId) => {
  try {
    const [reputation, ratings, endorsements, logs, allReputations] = await Promise.all([
      Reputation.findOne({ userId }),
      Rating.find({ ratedUserId: userId }),
      Endorsement.find({ endorseeId: userId }),
      ReputationLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Reputation.find({}, 'score').lean(), // for benchmarking
    ]);

    const subScores =
      ratings.length > 0
        ? {
            communication: parseFloat(
              (ratings.reduce((sum, r) => sum + r.communication, 0) / ratings.length).toFixed(1)
            ),
            clarity: parseFloat(
              (ratings.reduce((sum, r) => sum + r.clarity, 0) / ratings.length).toFixed(1)
            ),
            effort: parseFloat(
              (ratings.reduce((sum, r) => sum + r.effort, 0) / ratings.length).toFixed(1)
            ),
            timeCommitment: parseFloat(
              (ratings.reduce((sum, r) => sum + r.timeCommitment, 0) / ratings.length).toFixed(1)
            ),
          }
        : { communication: 0, clarity: 0, effort: 0, timeCommitment: 0 };

    const avgRating =
      ratings.length > 0
        ? parseFloat(
            (
              ratings.reduce(
                (sum, r) => sum + (r.clarity + r.effort + r.timeCommitment + r.communication) / 4,
                0
              ) / ratings.length
            ).toFixed(2)
          )
        : 0;

    const recentLogs = logs || [];
    const trend =
      recentLogs.length > 0
        ? recentLogs.reduce((sum, l) => sum + l.delta, 0) / recentLogs.length
        : 0;

    // ─── Completion Rate ──────────────────────────────────────
    let completionRate = null;
    try {
      // Adjust model/field names to match your actual Session model
      const Session = (await import('../models/Session.js')).default;
      const [completed, total] = await Promise.all([
        Session.countDocuments({ assignedTo: userId, status: 'completed' }),
        Session.countDocuments({ assignedTo: userId }),
      ]);
      completionRate = total > 0 ? parseFloat((completed / total).toFixed(2)) : null;
    } catch {
      // Session model may not exist yet — gracefully skip
      completionRate = null;
    }

    // ─── Rater Diversity ─────────────────────────────────────
    let raterDiversity = null;
    if (ratings.length >= 4) {
      const raterIds = ratings.map((r) => r.raterUserId?.toString()).filter(Boolean);
      const uniqueRaters = new Set(raterIds).size;
      raterDiversity = parseFloat((uniqueRaters / raterIds.length).toFixed(2));
    }

    // ─── Peer Benchmark ───────────────────────────────────────
    const currentScore = reputation?.score || 50;
    const benchmark = benchmarkAgainstPeers({ score: currentScore }, allReputations);

    // ─── Score Change History ─────────────────────────────────
    const scoreHistory = recentLogs.map((log) => ({
      date: log.createdAt,
      delta: log.delta,
      reason: log.reason || null,
      scoreAfter: log.scoreAfter || null,
    }));

    return {
      score: currentScore,
      tier: getTierFromScore(currentScore),
      avgRating,
      subScores,
      totalRatings: ratings.length,
      endorsementCount: endorsements.length,
      noShowCount: reputation?.noShowCount || 0,
      badges: reputation?.badges || [],
      recentTrend: trend,
      recentLogs,
      completionRate,
      raterDiversity,
      benchmark,
      scoreHistory,
    };
  } catch (error) {
    console.error('getReputationStats error:', error.message);
    return null;
  }
};

// ─── AI Explanation Generator ─────────────────────────────────
export const generateARISExplanation = async (stats, analysis) => {
  const benchmarkLine = stats.benchmark
    ? `Peer Ranking: Top ${100 - stats.benchmark.percentile}% (${stats.benchmark.percentile}th percentile of ${stats.benchmark.totalUsers} users). Platform average score: ${stats.benchmark.avgCohortScore}.`
    : '';

  const completionLine =
    stats.completionRate !== null
      ? `Session Completion Rate: ${Math.round(stats.completionRate * 100)}%.`
      : '';

  const prompt = `
Analyze this student's reputation and write a 2-3 sentence executive summary. Be specific — mention actual numbers. Do NOT use phrases like "overall" or "keep it up".

Score: ${stats.score}/100 [Tier: ${stats.tier}]
${benchmarkLine}
${completionLine}
Strengths: ${analysis.positives.join(', ') || 'None yet'}
Concerns: ${analysis.negatives.join(', ') || 'None'}
Rater Diversity: ${stats.raterDiversity !== null ? (stats.raterDiversity * 100).toFixed(0) + '%' : 'Unknown'}
`;
  return await callAI(prompt);
};

// ─── AI Roadmap Generator ─────────────────────────────────────
export const generateARISRoadmap = async (stats, analysis) => {
  const nextTier = getTierFromScore(getNextTierThreshold(stats.score));
  const pointsToNext = getNextTierThreshold(stats.score) - stats.score;

  const prompt = `
Create a professional 14-day reputation growth roadmap targeting ${nextTier} tier. Be specific with numbers.

Current: ${stats.score}/100 [${stats.tier}] — needs ${pointsToNext} more points.
Completion Rate: ${stats.completionRate !== null ? Math.round(stats.completionRate * 100) + '%' : 'unknown'}
Peer Ranking: ${stats.benchmark ? `${stats.benchmark.percentile}th percentile` : 'unknown'}

Sub-scores (out of 5):
- Communication: ${stats.subScores.communication}
- Clarity: ${stats.subScores.clarity}
- Effort: ${stats.subScores.effort}
- Reliability: ${stats.subScores.timeCommitment}

Activity: ${stats.totalRatings} sessions, ${stats.endorsementCount} endorsements, ${stats.noShowCount} no-shows
Deterministic recommendations: ${analysis.suggestions.map((s) => s.text).join(', ')}

Output 3 highly specific, numbered milestones with target metrics for each.
`;
  return await callAI(prompt);
};

// ─── Main Insights Controller ─────────────────────────────────
export const getReputationInsights = async (userId) => {
  try {
    const stats = await getReputationStats(userId);
    if (!stats) return { success: false, error: 'Stats unavailable' };

    const analysis = analyzeUserReputation(stats);
    const prediction = predictReputation(stats);

    const [aiSummary, aiRoadmap] = await Promise.all([
      generateARISExplanation(stats, analysis),
      generateARISRoadmap(stats, analysis),
    ]);

    return {
      success: true,
      data: {
        systemName: 'ARIS v2.1',
        score: stats.score,
        tier: stats.tier,
        nextTierThreshold: getNextTierThreshold(stats.score),
        pointsToNextTier: Math.max(0, getNextTierThreshold(stats.score) - stats.score),

        intelligence: {
          summary: aiSummary || 'Analysis complete. Continue your current activity patterns.',
          positives: analysis.positives,
          negatives: analysis.negatives,
          suggestions: analysis.suggestions, // always objects now
          roadmap: aiRoadmap || 'Complete more sessions and request ratings to unlock a personalised roadmap.',
          risks: analysis.risks,
          explainabilityScore: analysis.explainabilityScore,
        },

        prediction: {
          forecast: prediction.nextSevenDays,
          velocity: prediction.velocity,
        },

        benchmark: stats.benchmark
          ? {
              percentile: stats.benchmark.percentile,
              avgCohortScore: stats.benchmark.avgCohortScore,
              usersAhead: stats.benchmark.usersAhead,
              totalUsers: stats.benchmark.totalUsers,
            }
          : null,

        scoreHistory: stats.scoreHistory,

        stats: {
          avgRating: stats.avgRating,
          totalRatings: stats.totalRatings,
          endorsementCount: stats.endorsementCount,
          noShowCount: stats.noShowCount,
          badges: stats.badges,
          completionRate: stats.completionRate,
          raterDiversity: stats.raterDiversity,
          subScores: stats.subScores,
        },

        anomalies: analysis.risks.map((r) => ({
          type: 'risk_flag',
          severity: r.startsWith('Critical') ? 'critical' : 'warning',
          message: r,
        })),
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Prediction Endpoint ──────────────────────────────────────
export const predictFutureScore = async (userId, daysAhead = 7) => {
  try {
    const stats = await getReputationStats(userId);
    if (!stats) return { success: false, error: 'Stats unavailable' };

    const prediction = predictReputation(stats);

    // Scale prediction linearly for non-7-day requests
    const scaledDelta = ((prediction.nextSevenDays - stats.score) / 7) * daysAhead;
    const scaledScore = Math.round(
      Math.max(0, Math.min(100, stats.score + scaledDelta)) * 10
    ) / 10;

    return {
      success: true,
      data: {
        currentScore: stats.score,
        currentTier: stats.tier,
        predictedScore: scaledScore,
        predictedTier: getTierFromScore(scaledScore),
        daysAhead,
        trend:
          prediction.velocity === 'expanding'
            ? 'improving'
            : prediction.velocity === 'contracting'
            ? 'declining'
            : 'stable',
        benchmark: stats.benchmark,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  getReputationInsights,
  predictFutureScore,
};
