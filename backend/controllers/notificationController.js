import Notification from "../models/Notification.js";

/**
 * GET /api/notifications - Get all notifications for logged-in user
 * Query: ?limit=20&skip=0&unreadOnly=false
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const unreadOnly = req.query.unreadOnly === "true";

    const filter = { userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Notification.countDocuments(filter),
    ]);

    res.status(200).json({
      notifications,
      total,
      unreadCount: await Notification.countDocuments({ userId, isRead: false }),
    });
  } catch (err) {
    console.error("GET notifications error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/notifications/unread/count - Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error("GET unread count error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/notifications/:id/read - Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ notification });
  } catch (err) {
    console.error("Mark as read error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/notifications/read-all - Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount,
    });
  } catch (err) {
    console.error("Mark all as read error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/notifications/:id - Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/notifications - Delete all notifications
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} notifications`,
      count: result.deletedCount,
    });
  } catch (err) {
    console.error("Delete all notifications error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * INTERNAL: Create notification (called by other endpoints)
 * This should not be exposed as a public endpoint
 */
export const createNotification = async (
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

    console.log(`✅ Notification created for user ${userId}: ${type}`);
    return notification;
  } catch (err) {
    console.error("❌ Error creating notification:", err.message);
    throw err;
  }
};
