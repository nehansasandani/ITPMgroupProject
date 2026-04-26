import Notification from "../models/Notification.js";

/**
 * Notification Helper Utility
 * Use these functions throughout the app to send notifications
 */

export const sendNotification = async (
  userId,
  type,
  title,
  message,
  data = {},
  icon = "FiBell",
  link = null
) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      icon,
      link,
    });
    console.log(`✅ [${type}] Notification sent to user ${userId}`);
    return notification;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
  }
};

/**
 * Badge Earned Notification
 */
export const notifyBadgeEarned = async (userId, badgeName, badgeDescription) => {
  return sendNotification(
    userId,
    "badge_earned",
    "🏆 Badge Earned!",
    `Congratulations! You earned the "${badgeName}" badge.`,
    { badgeName, badgeDescription },
    "FiAward",
    "/profile"
  );
};

/**
 * Skill Verified Notification
 */
export const notifySkillVerified = async (userId, skillName, score) => {
  return sendNotification(
    userId,
    "skill_verified",
    "✅ Skill Verified!",
    `Your ${skillName} skill has been verified with a score of ${score}%.`,
    { skillName, score },
    "FiCheckCircle",
    "/profile/skills"
  );
};

/**
 * Skill Added Notification (for user's own reference)
 */
export const notifySkillAdded = async (userId, skillName, level) => {
  return sendNotification(
    userId,
    "skill_added",
    "📚 New Skill Added",
    `You added ${skillName} (${level} level) to your profile.`,
    { skillName, level },
    "FiPlus",
    "/profile/skills"
  );
};

/**
 * Rating Received Notification
 */
export const notifyRatingReceived = async (userId, raterName, rating, feedback) => {
  return sendNotification(
    userId,
    "rating_received",
    "⭐ You Got a Rating!",
    `${raterName} rated you ${rating}/5 stars.`,
    { raterName, rating, feedback },
    "FiStar",
    "/profile"
  );
};

/**
 * Endorsement Received Notification
 */
export const notifyEndorsementReceived = async (userId, endorserName, skillName) => {
  return sendNotification(
    userId,
    "endorsement_received",
    "👍 You Got an Endorsement!",
    `${endorserName} endorsed your ${skillName} skill.`,
    { endorserName, skillName },
    "FiThumbsUp",
    "/profile"
  );
};

/**
 * Session Scheduled Notification
 */
export const notifySessionScheduled = async (userId, partnerName, topic, time) => {
  return sendNotification(
    userId,
    "session_scheduled",
    "📅 Session Scheduled",
    `Session with ${partnerName} about ${topic} is scheduled for ${time}.`,
    { partnerName, topic, time },
    "FiCalendar",
    "/sessions"
  );
};

/**
 * Session Completed Notification
 */
export const notifySessionCompleted = async (userId, partnerName, topic) => {
  return sendNotification(
    userId,
    "session_completed",
    "✅ Session Completed",
    `Your session with ${partnerName} about ${topic} has been completed.`,
    { partnerName, topic },
    "FiCheckCircle",
    "/sessions"
  );
};

/**
 * Message Received Notification
 */
export const notifyMessageReceived = async (userId, senderName, messagePreview) => {
  return sendNotification(
    userId,
    "message_received",
    "💬 New Message",
    `${senderName}: ${messagePreview}`,
    { senderName, messagePreview },
    "FiMessageCircle",
    "/messages"
  );
};

/**
 * Reputation Milestone Notification
 */
export const notifyReputationMilestone = async (userId, milestone, currentScore) => {
  return sendNotification(
    userId,
    "reputation_milestone",
    "🎯 Reputation Milestone!",
    `You've reached a reputation score of ${currentScore}! ${milestone}`,
    { milestone, currentScore },
    "FiTrendingUp",
    "/profile"
  );
};

/**
 * Tier Promoted Notification
 */
export const notifyTierPromoted = async (userId, newTier, score) => {
  return sendNotification(
    userId,
    "tier_promoted",
    "🚀 Tier Promoted!",
    `Congratulations! You've been promoted to ${newTier} tier with a reputation score of ${score}.`,
    { newTier, score },
    "FiTrendingUp",
    "/profile"
  );
};

/**
 * Task Matched Notification
 */
export const notifyTaskMatched = async (userId, taskTitle, taskId) => {
  return sendNotification(
    userId,
    "task_matched",
    "🎯 Task Matched!",
    `You've been matched with the task: "${taskTitle}"`,
    { taskTitle, taskId },
    "FiTarget",
    `/tasks/${taskId}`
  );
};

/**
 * Task Completed Notification
 */
export const notifyTaskCompleted = async (userId, taskTitle) => {
  return sendNotification(
    userId,
    "task_completed",
    "✅ Task Completed",
    `Great job! The task "${taskTitle}" has been completed.`,
    { taskTitle },
    "FiCheckCircle",
    "/tasks"
  );
};

/**
 * Achievement Unlocked Notification
 */
export const notifyAchievementUnlocked = async (userId, achievementName, description) => {
  return sendNotification(
    userId,
    "achievement_unlocked",
    "🎉 Achievement Unlocked!",
    `You unlocked: ${achievementName} - ${description}`,
    { achievementName, description },
    "FiAward",
    "/profile"
  );
};
