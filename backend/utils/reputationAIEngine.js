/**
 * ============================================================
 * AI Reputation Intelligence System (ARIS) - Core Engine v2.1
 * ============================================================
 * Layer 2: Deterministic Intelligence Engine
 */

/**
 * analyzeUserReputation
 * All suggestions are normalized to objects with .text, .plan, .targetTab
 */
export const analyzeUserReputation = (data) => {
  const result = {
    positives: [],
    negatives: [],
    suggestions: [],
    risks: [],
    explainabilityScore: 40, // starts low, earned by data richness
  };

  // ─── Explainability Score (data richness) ───────────────────
  if (data.totalRatings >= 5)  result.explainabilityScore += 20;
  if (data.totalRatings >= 15) result.explainabilityScore += 15;
  if (data.endorsementCount >= 3) result.explainabilityScore += 10;
  if (data.noShowCount === 0) result.explainabilityScore += 10;
  if (data.completionRate !== null && data.completionRate !== undefined) result.explainabilityScore += 5;
  result.explainabilityScore = Math.min(100, result.explainabilityScore);

  // ─── 1. Positive Pattern Detection ──────────────────────────
  if (data.avgRating >= 4.5) {
    result.positives.push("High performance consistency (avg rating ≥ 4.5)");
  } else if (data.avgRating >= 4.0) {
    result.positives.push("Commendable peer feedback quality");
  }

  if (data.totalRatings >= 10) {
    result.positives.push("Highly active community contributor");
  }

  if (data.endorsementCount >= 5) {
    result.positives.push("Strong peer recognition via endorsements");
  }

  if (data.completionRate !== null && data.completionRate !== undefined && data.completionRate >= 0.9) {
    result.positives.push(`Excellent session completion rate (${Math.round(data.completionRate * 100)}%)`);
  }

  if (data.noShowCount === 0 && data.totalRatings >= 3) {
    result.positives.push("Perfect attendance — zero no-shows recorded");
  }

  // Peer benchmark positives
  if (data.benchmark) {
    if (data.benchmark.percentile >= 75) {
      result.positives.push(`Top ${100 - data.benchmark.percentile}% of all users on this platform`);
    }
  }

  // ─── 2. Negative Pattern Detection ──────────────────────────
  if (data.noShowCount > 0) {
    result.negatives.push(`${data.noShowCount} session no-show${data.noShowCount > 1 ? 's' : ''} on record`);
  }

  if (data.avgRating < 3.5 && data.totalRatings > 2) {
    result.negatives.push("Sub-optimal rating trend identified across sessions");
  }

  if (data.completionRate !== null && data.completionRate !== undefined && data.completionRate < 0.7 && data.totalRatings > 2) {
    result.negatives.push(`Low session completion rate (${Math.round(data.completionRate * 100)}%)`);
  }

  // Rater diversity check (collusion detection)
  if (data.raterDiversity !== null && data.raterDiversity !== undefined && data.totalRatings >= 4) {
    if (data.raterDiversity < 0.6) {
      result.negatives.push("Low rater diversity — ratings concentrated from a small peer group");
    }
  }

  // ─── 3. Structured Tactical Suggestions ─────────────────────
  if (data.noShowCount > 0) {
    result.suggestions.push({
      text: "Improve attendance to rebuild trust",
      plan: [
        "Enable calendar reminders 30 minutes before each session in 'My Tasks'.",
        "If you must cancel, do so 2+ hours in advance to avoid a no-show strike.",
        "Complete 3 consecutive sessions with no absences to offset the existing penalty."
      ],
      targetTab: "My Tasks",
      actionPath: "Go to My Tasks"
    });
  }

  if (data.subScores?.communication < 4.0 && data.totalRatings > 0) {
    result.suggestions.push({
      text: `Improve communication score (currently ${data.subScores.communication}/5)`,
      plan: [
        "Review previous session feedback in 'Performance History' to identify weak points.",
        "Update your 'Skills Portfolio' descriptions to be more concise and clearer.",
        "During your next session, ask 'Does this make sense so far?' at each milestone."
      ],
      targetTab: "Performance History",
      actionPath: "Go to Performance History"
    });
  }

  if (data.subScores?.effort < 4.0 && data.totalRatings > 0) {
    result.suggestions.push({
      text: `Boost effort score (currently ${data.subScores.effort}/5)`,
      plan: [
        "Review what peers said about your last session in 'Performance History'.",
        "Before each session, prepare 2-3 specific examples or solutions in advance.",
        "End each session with a summary of what was accomplished — peers rate effort higher when they see clear outcomes."
      ],
      targetTab: "Performance History",
      actionPath: "Go to Performance History"
    });
  }

  if (data.totalRatings < 3) {
    result.suggestions.push({
      text: `Complete ${3 - data.totalRatings} more session${3 - data.totalRatings > 1 ? 's' : ''} to build credibility`,
      plan: [
        "Go to 'My Tasks' and check your current completion status.",
        "Browse open tasks and accept at least one that matches your top-verified skills.",
        "After completing the session, ask the peer to leave a rating immediately."
      ],
      targetTab: "My Tasks",
      actionPath: "Go to My Tasks"
    });
  }

  if (data.endorsementCount < 5) {
    result.suggestions.push({
      text: `Earn ${5 - data.endorsementCount} more peer endorsement${5 - data.endorsementCount > 1 ? 's' : ''}`,
      plan: [
        "Go to 'Performance History' and identify peers you've helped recently.",
        "Message 3 of them to request an endorsement for your shared skills.",
        "Check your updated endorsement count in the 'Trophy Room'."
      ],
      targetTab: "Trophy Room",
      actionPath: "Go to Trophy Room"
    });
  }

  // ─── 4. Risk Identification ──────────────────────────────────
  if (data.noShowCount >= 2) {
    result.risks.push("Critical: Account suspension risk due to repeated no-shows");
  }

  const recentTrend = data.recentTrend || 0;
  if (recentTrend < -2) {
    result.risks.push("Warning: Sustained downward reputation trend detected");
  }

  if (data.raterDiversity !== null && data.raterDiversity !== undefined && data.raterDiversity < 0.6 && data.totalRatings >= 4) {
    result.risks.push("Integrity notice: Rating pattern shows low peer diversity");
  }

  if (data.completionRate !== null && data.completionRate !== undefined && data.completionRate < 0.5 && data.totalRatings > 2) {
    result.risks.push("Warning: Session completion rate is critically low");
  }

  return result;
};

/**
 * predictReputation
 * Estimates future score based on current momentum.
 */
export const predictReputation = (data) => {
  let momentum = 0;

  momentum += (data.avgRating - 2.5) * 2;
  momentum += Math.min(data.totalRatings || 0, 10) * 0.3; // recent activity (capped)
  momentum -= (data.noShowCount || 0) * 3;

  if (data.completionRate !== null && data.completionRate !== undefined) {
    momentum += (data.completionRate - 0.5) * 4;
  }

  const predictedScore = Math.max(0, Math.min(100, data.score + momentum));

  return {
    current: data.score,
    nextSevenDays: Math.round(predictedScore * 10) / 10,
    velocity: momentum > 0.5 ? 'expanding' : momentum < -0.5 ? 'contracting' : 'stable'
  };
};

/**
 * benchmarkAgainstPeers
 * Calculates percentile ranking vs all other users.
 * @param {Object} userStats - The current user's stats
 * @param {Array}  allScores - Array of all user reputation scores [{score}]
 */
export const benchmarkAgainstPeers = (userStats, allScores) => {
  if (!allScores || allScores.length === 0) return null;

  const sorted = allScores.map(s => s.score).sort((a, b) => a - b);
  const rank = sorted.filter(s => s <= userStats.score).length;
  const percentile = Math.round((rank / sorted.length) * 100);
  const avgCohortScore = parseFloat(
    (sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(1)
  );

  return {
    percentile,
    avgCohortScore,
    usersAhead: sorted.length - rank,
    totalUsers: sorted.length,
  };
};

export default {
  analyzeUserReputation,
  predictReputation,
  benchmarkAgainstPeers,
};
