import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Settings,
  Shield,
  Sliders,
  LoaderCircle,
  Database,
  CheckCircle,
  Clock,
  UserRound,
  FileText,
  RefreshCw,
  AlertCircle,
  Activity,
  Trophy,
  Heart,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const AdminSettings = () => {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      setError("");

      const res = await axios.get(`${API_URL}/api/admin/audit-logs`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setLogs(res.data.logs || []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Fetch audit logs err:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load administrative audit logs.",
      );
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatAction = (action) => {
    if (!action) return "Unknown action";

    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getActionStyle = (action = "") => {
    const normalized = action.toLowerCase();

    if (
      normalized.includes("delete") ||
      normalized.includes("suspend") ||
      normalized.includes("remove")
    ) {
      return {
        className: "bg-red-50 text-red-700 border-red-100",
        icon: Shield,
      };
    }

    if (
      normalized.includes("create") ||
      normalized.includes("approve") ||
      normalized.includes("verify") ||
      normalized.includes("publish")
    ) {
      return {
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: CheckCircle,
      };
    }

    if (
      normalized.includes("update") ||
      normalized.includes("edit") ||
      normalized.includes("review")
    ) {
      return {
        className: "bg-blue-50 text-blue-700 border-blue-100",
        icon: Activity,
      };
    }

    return {
      className: "bg-gray-100 text-gray-600 border-gray-200",
      icon: FileText,
    };
  };

  return (
    <div className="max-w-5xl space-y-7 text-[#242124]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
            Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            System Settings
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#77716F]">
            Review platform configuration, understand system defaults, and
            monitor administrative activity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-[#EBE8E5] bg-white px-4 py-3 shadow-sm sm:self-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F9EAED] text-[#991B35]">
            <Settings size={18} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918D]">
              System access
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#302B29]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Platform Parameters */}
      <section className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#F0EDEA] px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
            <Sliders size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#242124]">
              Platform Parameters
            </h2>
            <p className="mt-1 text-xs text-[#96908C]">
              Current platform milestone and competition defaults
            </p>
          </div>

          <span className="ml-auto rounded-full border border-[#EBE8E5] bg-[#FAF9F7] px-3 py-1 text-[10px] font-semibold text-[#918984]">
            Default values
          </span>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {/* Like Milestone */}
          <div className="rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
                <Heart size={19} />
              </div>

              <span className="rounded-full border border-[#EBE8E5] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#918984]">
                Default
              </span>
            </div>

            <p className="mt-5 text-xs font-medium text-[#77716F]">
              Like Milestone Interval
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-[#242124]">
              100 Likes
            </p>

            <p className="mt-2 text-xs leading-relaxed text-[#96908C]">
              Automatic celebration milestones are set at 100, 200, 300, and
              subsequent intervals.
            </p>
          </div>

          {/* Championship Threshold */}
          <div className="rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy size={19} />
              </div>

              <span className="rounded-full border border-[#EBE8E5] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#918984]">
                Default
              </span>
            </div>

            <p className="mt-5 text-xs font-medium text-[#77716F]">
              Championship Crown Threshold
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-[#242124]">
              1,000 Likes
            </p>

            <p className="mt-2 text-xs leading-relaxed text-[#96908C]">
              Qualifying like threshold for championship winner selection across
              eligible Manchs.
            </p>
          </div>
        </div>

        <div className="mx-5 mb-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 sm:mx-6 sm:mb-6">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-xs leading-relaxed text-blue-800">
            These values are currently informational defaults. Changing them
            here is not supported because no settings-update API is connected to
            this page.
          </p>
        </div>
      </section>

      {/* System Information */}
      <section className="rounded-2xl border border-[#EBE8E5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
            <Database size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#242124]">
              Administrative Records
            </h2>
            <p className="mt-1 text-xs text-[#96908C]">
              Activity records generated by administrator actions
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-[#F0EDEA] bg-[#FAF9F7] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#991B35] shadow-sm">
              <FileText size={17} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918D]">
                Audit entries loaded
              </p>
              <p className="mt-0.5 text-lg font-bold text-[#242124]">
                {loadingLogs ? "—" : logs.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#F0EDEA] bg-[#FAF9F7] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
              <Shield size={17} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918D]">
                Audit monitoring
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#242124]">
                {loadingLogs
                  ? "Loading..."
                  : error
                    ? "Unavailable"
                    : "Available"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Trail */}
      <section className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#F0EDEA] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
              <Shield size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#242124]">
                Administrative Audit Trail
              </h2>
              <p className="mt-1 text-xs text-[#96908C]">
                A record of actions performed by administrators
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#EBE8E5] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#6F6864] transition hover:border-[#991B35]/30 hover:bg-[#F9EAED] hover:text-[#991B35] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loadingLogs ? "animate-spin" : ""}
            />
            Refresh logs
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>

              <button
                type="button"
                onClick={fetchLogs}
                className="shrink-0 text-xs font-semibold text-red-700 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {loadingLogs ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoaderCircle size={28} className="animate-spin text-[#991B35]" />
              <p className="mt-3 text-sm text-[#96908C]">
                Loading administrative records...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9EAED] text-[#991B35]">
                <Shield size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#242124]">
                No audit records yet
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#96908C]">
                Administrative actions will appear here when they are recorded
                by the platform.
              </p>
            </div>
          ) : (
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {logs.map((log) => {
                const actionStyle = getActionStyle(log.action);
                const ActionIcon = actionStyle.icon;

                return (
                  <div
                    key={log._id}
                    className="group flex flex-col gap-3 rounded-xl border border-[#EBE8E5] bg-white p-4 transition hover:border-[#DCCBD0] hover:bg-[#FCFBFA] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF9F7] text-[#77716F]">
                        <ActionIcon size={16} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold ${actionStyle.className}`}
                          >
                            {formatAction(log.action)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="font-semibold text-[#403A37]">
                            {log.admin?.name || "Admin"}
                          </span>

                          <span className="text-[#B0A8A3]">•</span>

                          <span className="text-[#918984]">
                            {log.targetType || "System"} target
                          </span>
                        </div>

                        <p className="mt-1 break-all text-[10px] text-[#A19A96]">
                          Target ID: {log.targetId || "Global action"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 pl-12 text-[10px] text-[#918984] sm:pl-0">
                      <Clock size={13} />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loadingLogs && logs.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#F0EDEA] bg-[#FAF9F7] px-5 py-3 sm:px-6">
            <span className="text-[11px] text-[#918984]">
              Showing {logs.length} audit records
            </span>

            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle size={13} />
              Records loaded
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSettings;
