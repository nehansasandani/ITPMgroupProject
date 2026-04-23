import axiosInstance from "./axiosInstance";

/**
 * Get all notifications for current user
 * @param {number} limit - How many notifications to fetch
 * @param {number} skip - How many to skip (for pagination)
 * @param {boolean} unreadOnly - Fetch only unread notifications
 */
export const getNotifications = async (limit = 20, skip = 0, unreadOnly = false) => {
  try {
    const res = await axiosInstance.get("/notifications", {
      params: { limit, skip, unreadOnly },
    });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    const res = await axiosInstance.get("/notifications/unread/count");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - ID of notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return res.data;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const res = await axiosInstance.patch("/notifications/read-all");
    return res.data;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete a single notification
 * @param {string} notificationId - ID of notification to delete
 */
export const deleteNotification = async (notificationId) => {
  try {
    const res = await axiosInstance.delete(`/notifications/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async () => {
  try {
    const res = await axiosInstance.delete("/notifications");
    return res.data;
  } catch (error) {
    console.error("Failed to delete all notifications:", error);
    throw error;
  }
};
