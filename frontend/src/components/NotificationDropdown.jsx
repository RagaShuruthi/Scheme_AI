import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userService.getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkRead = async (id) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-700" />
              <h3 className="font-semibold text-sm text-slate-800">Notifications & Alerts</h3>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No scheme updates or alerts yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors ${
                    notif.is_read ? 'bg-white' : 'bg-blue-50/50'
                  } hover:bg-slate-50`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-xs text-slate-900 leading-tight">
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[11px] text-blue-600 hover:underline shrink-0"
                        title="Mark read"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium mt-2 hover:underline"
                    >
                      View Scheme <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
