import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "badge_earned",        // User earned a badge
        "skill_verified",      // User skill was verified
        "skill_added",         // User added a new skill
        "rating_received",     // User received a rating
        "endorsement_received", // User received endorsement
        "session_scheduled",   // Session was scheduled
        "session_completed",   // Session was completed
        "message_received",    // User received a message
        "reputation_milestone", // Reached reputation milestone
        "tier_promoted",       // Promoted to new tier
        "task_matched",        // Task matched with user
        "task_completed",      // Task was completed
        "achievement_unlocked", // Achievement unlocked
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      // e.g., "Badge Earned!", "New Skill Verified", "You Got a Rating!"
    },
    message: {
      type: String,
      required: true,
      // e.g., "You earned the 'Top Contributor' badge!"
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Extra data: { skillName: "React", badgeName: "Expert", rating: 4.5, etc. }
    },
    icon: {
      type: String,
      default: "FiBell",
      // Icon name from react-icons: FiAward, FiCheckCircle, FiThumbsUp, etc.
    },
    link: {
      type: String,
      default: null,
      // Route to navigate to: "/profile", "/skills", "/messages", etc.
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false } // We're managing timestamps manually
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications after 30 days (TTL index)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("Notification", NotificationSchema);
