import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Calendar,
  Sparkles,
  ShieldAlert,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const getNotificationIcon = (type) => {
  switch (type) {
    case "post_liked":
      return <Heart size={16} className="text-[#FF4DB8] fill-[#FF4DB8]" />;
    case "post_commented":
      return <MessageCircle size={16} className="text-[#00D4FF]" />;
    case "new_subscriber":
      return <UserPlus size={16} className="text-[#B7FF3F]" />;
    case "like_milestone":
      return <Trophy size={16} className="text-[#FFD700]" />;
    case "winner_announcement":
      return <Trophy size={16} className="text-[#FFD700] fill-[#FFD700]" />;
    case "new_post":
      return <Sparkles size={16} className="text-[#FF789A]" />;
    case "event_registration":
    case "event_announcement":
      return <Calendar size={16} className="text-[#00D4FF]" />;
    case "admin_notice":
      return <ShieldAlert size={16} className="text-amber-400" />;
    default:
      return <Bell size={16} className="text-slate-400" />;
  }
};

const Notifications = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchNotifications(1);
  }, [isAuthenticated]);

  const fetchNotifications = async (targetPage = 1, append = false) => {
    try {
      if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`${API_URL}/api/notifications`, {
        params: { page: targetPage, limit: 15 },
        withCredentials: true,
      });

      if (res.data.success) {
        const list = res.data.notifications || [];
        setNotifications((prev) => (append ? [...prev, ...list] : list));
        setUnreadCount(res.data.unreadCount || 0);
        setHasMore(Boolean(res.data.pagination?.hasMore));
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Fetch notifications err:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Mark read err:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Mark all read err:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/api/notifications/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Delete notification err:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A30] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] text-white shadow-[0_0_20px_rgba(255,77,184,0.3)]">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="font-['Orbitron'] text-xl font-bold sm:text-2xl">
                Notification Center
              </h1>
              <p className="text-xs text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} unread update(s)`
                  : "You are completely caught up!"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#081326] px-4 py-2 text-xs font-semibold text-[#00D4FF] transition hover:border-[#00D4FF]"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <LoaderCircle size={32} className="animate-spin text-[#FF4DB8]" />
            <p className="mt-4 text-xs font-['Orbitron'] uppercase tracking-widest">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#071333] p-12 text-center">
            <Bell size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="font-['Orbitron'] text-base font-bold text-white">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              When people like your work, subscribe, comment, or win
              competitions, updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`group relative flex items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                  n.isRead
                    ? "border-white/5 bg-[#071333]/50 hover:bg-[#071333]"
                    : "border-[#FF4DB8]/30 bg-[#0A1640] shadow-[0_0_15px_rgba(255,77,184,0.06)] hover:border-[#FF4DB8]/60"
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#050A30]">
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#FF4DB8] shadow-[0_0_8px_#FF4DB8]" />
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {n.message}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-500">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link
                      to={n.link}
                      className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-[#00D4FF] hover:text-[#00D4FF]"
                      title="View"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n._id);
                    }}
                    className="rounded-full border border-white/10 p-2 text-slate-500 transition hover:border-red-500/40 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="pt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNotifications(page + 1, true)}
                  disabled={loadingMore}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
