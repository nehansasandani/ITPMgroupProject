import React, { useState, useEffect, useRef } from 'react';
import {
  FiBell, FiX, FiCheckCircle, FiAward, FiThumbsUp, FiStar,
  FiMessageCircle, FiCalendar, FiTarget, FiTrendingUp, FiTrash2,
  FiCheck, FiChevronRight
} from 'react-icons/fi';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../api/notificationApi';

/**
 * NotificationCenter - Displays user notifications in a dropdown panel
 * Shows: badges earned, skills verified, ratings, endorsements, etc.
 */
export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // Fetch notifications on mount and when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fetch unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(15, 0, false);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications?')) {
      try {
        await deleteAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to delete all notifications:', error);
      }
    }
  };

  const getNotificationIcon = (notification) => {
    const iconProps = { size: 18, className: "text-indigo-400" };

    switch (notification.type) {
      case 'badge_earned':
        return <FiAward {...iconProps} />;
      case 'skill_verified':
        return <FiCheckCircle {...iconProps} className="text-emerald-400" />;
      case 'endorsement_received':
        return <FiThumbsUp {...iconProps} className="text-blue-400" />;
      case 'rating_received':
        return <FiStar {...iconProps} className="text-yellow-400" />;
      case 'message_received':
        return <FiMessageCircle {...iconProps} className="text-cyan-400" />;
      case 'session_scheduled':
        return <FiCalendar {...iconProps} className="text-purple-400" />;
      case 'task_matched':
        return <FiTarget {...iconProps} className="text-pink-400" />;
      case 'tier_promoted':
        return <FiTrendingUp {...iconProps} className="text-green-400" />;
      default:
        return <FiBell {...iconProps} />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-white"
        title="Notifications"
      >
        <FiBell size={20} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-700 rounded-lg transition"
            >
              <FiX size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-6 py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FiBell size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 border-b border-slate-700/30 transition hover:bg-slate-800/30 ${
                    !notification.isRead ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-white text-sm">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed mb-2">
                        {notification.message}
                      </p>

                      <p className="text-slate-500 text-xs">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-1 hover:bg-slate-700 rounded transition"
                          title="Mark as read"
                        >
                          <FiCheck size={14} className="text-slate-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1 hover:bg-red-500/20 rounded transition"
                        title="Delete"
                      >
                        <FiTrash2 size={14} className="text-slate-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700 flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex-1 text-xs py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center justify-center gap-1"
                >
                  <FiCheck size={14} />
                  Mark All Read
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="flex-1 text-xs py-2 px-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                <FiTrash2 size={14} className="inline mr-1" />
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
