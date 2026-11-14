import React, { useState } from "react";
import axios from "axios";
import {
  Megaphone,
  Send,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Users,
  Link2,
  Eye,
  FileText,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const AdminAnnouncements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) return;

    try {
      setSending(true);
      setStatusMessage("");
      setIsSuccess(false);

      const res = await axios.post(
        `${API_URL}/api/admin/announcements`,
        {
          title: title.trim(),
          message: message.trim(),
          link: link.trim(),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        setIsSuccess(true);
        setStatusMessage(
          res.data.message || "Announcement broadcast successfully!",
        );

        setTitle("");
        setMessage("");
        setLink("");
      } else {
        setIsSuccess(false);
        setStatusMessage(
          res.data.message || "Unable to broadcast announcement.",
        );
      }
    } catch (err) {
      console.error("Announcement error:", err);

      setIsSuccess(false);
      setStatusMessage(
        err.response?.data?.message || "Failed to broadcast announcement.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* PAGE INTRO */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#991B35]">
            Community Communication
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Platform Announcements
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Share important updates, event announcements, and platform news with
          your PRATIVA community.
        </p>
      </div>

      {/* INFO STRIP */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#991B35]/10 bg-[#991B35]/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#991B35] shadow-sm">
            <Megaphone size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Official community broadcast
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Your announcement will be sent through the platform notification
              system.
            </p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
          <Users size={14} className="text-[#991B35]" />
          Community audience
        </div>
      </div>

      {/* EDITOR + PREVIEW */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* ANNOUNCEMENT FORM */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 sm:px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#991B35]/[0.08] text-[#991B35]">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Compose announcement
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Create your message before publishing
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
            {/* TITLE */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="announcement-title"
                  className="text-sm font-semibold text-gray-700"
                >
                  Announcement title <span className="text-[#991B35]">*</span>
                </label>

                <span className="text-[11px] text-gray-400">
                  {title.length}/120
                </span>
              </div>

              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A new creative event is here!"
                required
                maxLength={120}
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F7] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#991B35] focus:bg-white focus:ring-4 focus:ring-[#991B35]/[0.06]"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="announcement-message"
                  className="text-sm font-semibold text-gray-700"
                >
                  Announcement message <span className="text-[#991B35]">*</span>
                </label>

                <span
                  className={`text-[11px] ${
                    message.length >= 450
                      ? "font-semibold text-[#991B35]"
                      : "text-gray-400"
                  }`}
                >
                  {message.length}/500
                </span>
              </div>

              <textarea
                id="announcement-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full announcement that will appear in users' Notification Center..."
                rows={6}
                required
                maxLength={500}
                className="w-full resize-y rounded-xl border border-gray-200 bg-[#FAF9F7] px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#991B35] focus:bg-white focus:ring-4 focus:ring-[#991B35]/[0.06]"
              />
            </div>

            {/* LINK */}
            <div>
              <label
                htmlFor="announcement-link"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Link2 size={15} className="text-gray-400" />
                Navigation link
                <span className="text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="announcement-link"
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/events or /leaderboard"
                className="w-full rounded-xl border border-gray-200 bg-[#FAF9F7] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#991B35] focus:bg-white focus:ring-4 focus:ring-[#991B35]/[0.06]"
              />

              <p className="mt-2 text-[11px] leading-5 text-gray-400">
                Add an internal platform path if users should be directed
                somewhere after opening the notification.
              </p>
            </div>

            {/* STATUS */}
            {statusMessage && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  isSuccess
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                )}

                <p className="leading-6">{statusMessage}</p>
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-5 text-gray-400">
                Please review your announcement before publishing.
              </p>

              <button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F172D] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}

                {sending ? "Publishing..." : "Publish announcement"}
              </button>
            </div>
          </form>
        </div>

        {/* LIVE PREVIEW */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={17} className="text-[#991B35]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Live preview
                </h3>
              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-500">
                PREVIEW
              </span>
            </div>

            {/* NOTIFICATION CARD PREVIEW */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#FAF9F7]">
              <div className="flex items-center gap-3 border-b border-gray-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#991B35] text-white">
                  <Megaphone size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900">PRATIVA</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Official announcement
                  </p>
                </div>

                <span className="h-2 w-2 rounded-full bg-[#991B35]" />
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <h4 className="break-words text-base font-bold leading-6 text-gray-900">
                  {title.trim() || "Your announcement title"}
                </h4>

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                  {message.trim() ||
                    "Your announcement message will appear here as you type. Make it clear, helpful, and engaging for your community."}
                </p>

                {link.trim() && (
                  <div className="flex items-center gap-2 border-t border-gray-200 pt-3 text-xs font-semibold text-[#991B35]">
                    <span>Open announcement link</span>
                    <ArrowUpRight size={14} />
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-400">
                  Just now · PRATIVA Community
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-400">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-[#991B35]" />
              <p>
                This is a visual preview of your announcement, not an actual
                notification.
              </p>
            </div>
          </div>

          {/* PUBLISHING GUIDANCE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-bold text-gray-900">
              Publishing guidelines
            </h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Keep it clear
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Use a descriptive title and a message that explains the
                    important details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Link2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Add useful links
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Direct users to the relevant event, competition, or platform
                    page when appropriate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Consider your audience
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Announcements are official platform communications. Make
                    sure the information is accurate before publishing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
