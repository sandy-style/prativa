import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LoaderCircle,
  Eye,
  Trash2,
  Ban,
  X,
  Filter,
  UserRound,
  FileText,
  CalendarDays,
  MessageSquare,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  reviewing: "bg-blue-50 text-blue-700 border-blue-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  dismissed: "bg-gray-100 text-gray-600 border-gray-200",
};

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [moderatorNotes, setModeratorNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await axios.get(`${API_URL}/api/reports`, {
        params,
        withCredentials: true,
      });

      if (res.data.success) {
        setReports(res.data.reports || []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load reports. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleTakeAction = async (action) => {
    if (!selectedReport || actionLoading) return;

    const actionLabels = {
      dismiss: "dismiss this report",
      issue_warning: "issue a warning",
      remove_post: "remove the reported post",
      suspend_user: "suspend this account",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabels[action] || "perform this action"}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const res = await axios.post(
        `${API_URL}/api/reports/${selectedReport._id}/action`,
        {
          action,
          moderatorNotes: moderatorNotes.trim(),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        setSelectedReport(null);
        setModeratorNotes("");
        await fetchReports();
      }
    } catch (err) {
      console.error("Take action err:", err);
      alert(
        err.response?.data?.message || "Failed to execute moderation action.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLabel = (value) => {
    if (!value) return "None";

    return value.replace(/_/g, " ");
  };

  const getTargetName = (report) => {
    return (
      report.targetPost?.title ||
      report.targetUser?.name ||
      report.contentSnapshot?.title ||
      report.contentSnapshot?.name ||
      "Snapshot"
    );
  };

  const statusCounts = {
    pending: reports.filter((r) => r.status === "pending").length,
    reviewing: reports.filter((r) => r.status === "reviewing").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-7 text-[#242124]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
            Trust & safety
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            Community Reports
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#77716F]">
            Review reported content and user profiles, investigate community
            concerns, and take appropriate moderation actions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-[#EBE8E5] bg-white px-4 py-3 shadow-sm sm:self-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F9EAED] text-[#991B35]">
            <ShieldAlert size={19} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918D]">
              Reports displayed
            </p>
            <p className="text-lg font-bold text-[#242124]">{reports.length}</p>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#77716F]">Pending review</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#242124]">
            {statusCounts.pending}
          </p>
          <p className="mt-1 text-[11px] text-[#A19A96]">Awaiting moderation</p>
        </div>

        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#77716F]">Under review</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Eye size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#242124]">
            {statusCounts.reviewing}
          </p>
          <p className="mt-1 text-[11px] text-[#A19A96]">Being investigated</p>
        </div>

        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#77716F]">Resolved</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#242124]">
            {statusCounts.resolved}
          </p>
          <p className="mt-1 text-[11px] text-[#A19A96]">Action completed</p>
        </div>

        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#77716F]">Dismissed</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <XCircle size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#242124]">
            {statusCounts.dismissed}
          </p>
          <p className="mt-1 text-[11px] text-[#A19A96]">No action required</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#242124]">Moderation queue</h2>
          <p className="mt-1 text-xs text-[#96908C]">
            Filter reports by their current review status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[#99918D]" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[170px] rounded-xl border border-[#E9E5E2] bg-[#FAF9F7] px-3 py-2.5 text-xs font-semibold text-[#5F5854] outline-none transition focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending review</option>
            <option value="reviewing">Under review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={17} />
            {error}
          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="text-xs font-semibold text-red-700 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reports Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#F0EDEA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-sm font-bold text-[#242124]">Report records</h3>
            <p className="mt-1 text-xs text-[#96908C]">
              Review submitted community safety reports
            </p>
          </div>

          <span className="w-fit rounded-lg bg-[#FAF9F7] px-3 py-1.5 text-xs font-medium text-[#77716F]">
            {statusFilter === "all" ? "All reports" : formatLabel(statusFilter)}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoaderCircle size={30} className="animate-spin text-[#991B35]" />
            <p className="mt-3 text-sm text-[#96908C]">
              Loading community reports...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9EAED] text-[#991B35]">
              <ShieldCheck size={26} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#242124]">
              No reports found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#96908C]">
              There are no reports matching this status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-[#F0EDEA] bg-[#FAF9F7]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#918984]">
                  <th className="px-6 py-4">Reported target</th>
                  <th className="px-4 py-4">Reason</th>
                  <th className="px-4 py-4">Reporter</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action taken</th>
                  <th className="px-4 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Inspect</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F2EFEC]">
                {reports.map((r) => (
                  <tr key={r._id} className="transition hover:bg-[#FCFBFA]">
                    <td className="max-w-[230px] px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
                          {r.targetType === "post" ? (
                            <FileText size={16} />
                          ) : (
                            <UserRound size={16} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold capitalize text-[#302B29]">
                            {r.targetType || "Unknown"}: {getTargetName(r)}
                          </p>
                          <p className="mt-1 text-[11px] text-[#A19A96]">
                            Report ID: {r._id?.slice(-8) || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-amber-700">
                        {formatLabel(r.reason)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F2EFEC] text-[#77716F]">
                          <UserRound size={13} />
                        </div>
                        <span className="max-w-[120px] truncate text-xs font-medium text-[#5F5854]">
                          {r.reporter?.name || "Member"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${
                          statusStyles[r.status] ||
                          "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatLabel(r.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs capitalize text-[#77716F]">
                        {formatLabel(r.actionTaken)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-[#77716F]">
                        <CalendarDays size={13} className="text-[#A49C97]" />
                        {formatDate(r.createdAt)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(r);
                          setModeratorNotes(r.moderatorNotes || "");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBE8E5] bg-white px-3 py-2 text-xs font-semibold text-[#6F6864] transition hover:border-[#991B35]/30 hover:bg-[#F9EAED] hover:text-[#991B35]"
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171414]/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) {
              setSelectedReport(null);
            }
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F0EDEA] px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#991B35]">
                  Trust & safety
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#242124]">
                  Review Report
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                disabled={actionLoading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F3F1] text-[#77716F] transition hover:bg-[#F9EAED] hover:text-[#991B35] disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-5 overflow-y-auto p-6">
              {/* Report Summary */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#99918D]">
                    Report reason
                  </span>
                  <p className="mt-1 text-sm font-bold capitalize text-[#991B35]">
                    {formatLabel(selectedReport.reason)}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${
                    statusStyles[selectedReport.status] ||
                    "border-gray-200 bg-gray-100 text-gray-600"
                  }`}
                >
                  {formatLabel(selectedReport.status)}
                </span>
              </div>

              {/* Reporter Details */}
              <section className="rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <UserRound size={16} className="text-[#991B35]" />
                  <h4 className="text-xs font-bold text-[#302B29]">
                    Reporter information
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-[#77716F]">
                    Name:{" "}
                    <span className="font-semibold text-[#302B29]">
                      {selectedReport.reporter?.name || "Unknown"}
                    </span>
                  </p>

                  <p className="break-all text-[#77716F]">
                    Email:{" "}
                    <span className="font-semibold text-[#302B29]">
                      {selectedReport.reporter?.email || "Not available"}
                    </span>
                  </p>

                  <p className="text-[#77716F]">
                    Submitted:{" "}
                    <span className="font-semibold text-[#302B29]">
                      {formatDate(selectedReport.createdAt)}
                    </span>
                  </p>
                </div>

                {selectedReport.description && (
                  <div className="mt-4 border-t border-[#EAE5E1] pt-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#99918D]">
                      Reporter notes
                    </p>
                    <p className="text-xs leading-relaxed text-[#5F5854]">
                      {selectedReport.description}
                    </p>
                  </div>
                )}
              </section>

              {/* Reported Content */}
              <section className="rounded-xl border border-[#EBE8E5] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-[#991B35]" />
                  <h4 className="text-xs font-bold text-[#302B29]">
                    Reported content details
                  </h4>
                </div>

                {selectedReport.targetType === "post" ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-[#77716F]">
                      Title:{" "}
                      <span className="font-semibold text-[#302B29]">
                        {selectedReport.contentSnapshot?.title || "Untitled"}
                      </span>
                    </p>

                    <p className="text-[#77716F]">
                      Author:{" "}
                      <span className="font-semibold text-[#302B29]">
                        {selectedReport.contentSnapshot?.authorName ||
                          "Unknown"}
                      </span>
                    </p>

                    <p className="text-[#77716F]">
                      Category:{" "}
                      <span className="font-semibold capitalize text-[#302B29]">
                        {selectedReport.contentSnapshot?.category || "Unknown"}
                      </span>
                    </p>

                    {selectedReport.contentSnapshot?.media?.url && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-2">
                        {selectedReport.contentSnapshot.media.type ===
                        "image" ? (
                          <img
                            src={selectedReport.contentSnapshot.media.url}
                            alt="Reported content"
                            className="max-h-56 w-full rounded-lg object-contain"
                          />
                        ) : (
                          <div className="p-2">
                            <p className="mb-2 text-[10px] font-semibold text-[#77716F]">
                              Reported audio
                            </p>
                            <audio
                              src={selectedReport.contentSnapshot.media.url}
                              controls
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {selectedReport.contentSnapshot?.description && (
                      <div className="mt-3 border-t border-[#F0EDEA] pt-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#99918D]">
                          Description
                        </p>
                        <p className="leading-relaxed text-[#5F5854]">
                          {selectedReport.contentSnapshot.description}
                        </p>
                      </div>
                    )}

                    {selectedReport.contentSnapshot?.content && (
                      <div className="mt-3 max-h-40 overflow-y-auto whitespace-pre-line rounded-lg bg-[#FAF9F7] p-3 font-serif leading-relaxed text-[#5F5854]">
                        {selectedReport.contentSnapshot.content}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <p className="text-[#77716F]">
                      Name:{" "}
                      <span className="font-semibold text-[#302B29]">
                        {selectedReport.contentSnapshot?.name || "Unknown"}
                      </span>
                    </p>

                    <p className="text-[#77716F]">
                      Username:{" "}
                      <span className="font-semibold text-[#302B29]">
                        {selectedReport.contentSnapshot?.username
                          ? `@${selectedReport.contentSnapshot.username}`
                          : "Not available"}
                      </span>
                    </p>
                  </div>
                )}
              </section>

              {/* Existing Action */}
              {selectedReport.actionTaken && (
                <div className="rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#99918D]">
                    Previous action
                  </p>
                  <p className="mt-1 text-xs font-semibold capitalize text-[#5F5854]">
                    {formatLabel(selectedReport.actionTaken)}
                  </p>
                </div>
              )}

              {/* Moderator Notes */}
              <section>
                <label
                  htmlFor="moderator-notes"
                  className="mb-2 flex items-center gap-2 text-xs font-bold text-[#302B29]"
                >
                  <MessageSquare size={15} className="text-[#991B35]" />
                  Moderator audit notes
                </label>

                <textarea
                  id="moderator-notes"
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  rows={3}
                  disabled={actionLoading}
                  placeholder="Record the reason for your moderation decision..."
                  className="w-full resize-y rounded-xl border border-[#E9E5E2] bg-[#FAF9F7] p-3 text-xs leading-relaxed text-[#302B29] outline-none transition placeholder:text-[#AAA29E] focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10 disabled:opacity-60"
                />
                <p className="mt-1.5 text-[10px] text-[#A19A96]">
                  These notes are submitted with your moderation decision.
                </p>
              </section>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#F0EDEA] bg-[#FAF9F7] px-6 py-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert size={15} className="text-[#991B35]" />
                <p className="text-xs font-bold text-[#302B29]">
                  Moderation actions
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTakeAction("dismiss")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E2DE] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#6F6864] transition hover:bg-[#F2EFEC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={14} />
                  Dismiss
                </button>

                <button
                  type="button"
                  onClick={() => handleTakeAction("issue_warning")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <AlertTriangle size={14} />
                  Issue warning
                </button>

                {selectedReport.targetType === "post" && (
                  <button
                    type="button"
                    onClick={() => handleTakeAction("remove_post")}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remove post
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleTakeAction("suspend_user")}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#991B35] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7E172C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Ban size={14} />
                  Suspend account
                </button>
              </div>

              {actionLoading && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#991B35]">
                  <LoaderCircle size={14} className="animate-spin" />
                  Processing moderation action...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
