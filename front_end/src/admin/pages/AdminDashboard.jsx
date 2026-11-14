import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Heart,
  MessageCircle,
  UserCheck,
  ShieldAlert,
  Calendar,
  Trophy,
  Crown,
  ArrowRight,
  LoaderCircle,
  Activity,
  Layers,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setFetchError("");

        const res = await axios.get(`${API_URL}/api/admin/stats`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setStats(res.data.stats);
          setRecentUsers(res.data.recentUsers || []);
          setRecentPosts(res.data.recentPosts || []);
          setRecentReports(res.data.recentReports || []);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
        setFetchError(
          err.response?.data?.message || "Unable to load dashboard statistics.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-[#991B35]" />
        <p className="mt-3 text-sm text-[#88817E]">Loading your dashboard...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-[#EBE8E5] bg-white p-8 text-center shadow-sm">
        <div className="rounded-2xl bg-red-50 p-4 text-red-600">
          <AlertCircle size={28} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#242124]">
          Dashboard unavailable
        </h2>
        <p className="mt-2 max-w-md text-sm text-[#88817E]">{fetchError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-[#991B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7F172D]"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Members",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Active Creators",
      value: stats?.totalCreators || 0,
      icon: UserCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Posts",
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: "text-[#991B35]",
      bg: "bg-[#991B35]/10",
    },
    {
      label: "Community Likes",
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: "text-rose-700",
      bg: "bg-rose-50",
    },
    {
      label: "Comments",
      value: stats?.totalComments || 0,
      icon: MessageCircle,
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      label: "Subscriptions",
      value: stats?.totalSubscriptions || 0,
      icon: Activity,
      color: "text-cyan-700",
      bg: "bg-cyan-50",
    },
    {
      label: "Safety Reports",
      value: stats?.totalReports || 0,
      sub: `${stats?.pendingReports || 0} pending`,
      icon: ShieldAlert,
      color: "text-red-700",
      bg: "bg-red-50",
    },
    {
      label: "Live Events",
      value: stats?.activeEvents || 0,
      icon: Calendar,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      label: "Competitions",
      value: stats?.totalCompetitions || 0,
      icon: Trophy,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Declared Winners",
      value: stats?.totalWinners || 0,
      icon: Crown,
      color: "text-orange-700",
      bg: "bg-orange-50",
    },
  ];

  const manchs = [
    {
      id: "voice",
      name: "Swar Manch",
      subtitle: "Voice",
      value: stats?.manchDistribution?.voice || 0,
      color: "bg-[#991B35]",
      light: "bg-[#991B35]/10",
      text: "text-[#991B35]",
    },
    {
      id: "vision",
      name: "Drishya Manch",
      subtitle: "Vision",
      value: stats?.manchDistribution?.vision || 0,
      color: "bg-blue-600",
      light: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      id: "art",
      name: "Rang Manch",
      subtitle: "Art",
      value: stats?.manchDistribution?.art || 0,
      color: "bg-purple-600",
      light: "bg-purple-50",
      text: "text-purple-700",
    },
    {
      id: "words",
      name: "Shabda Manch",
      subtitle: "Words",
      value: stats?.manchDistribution?.words || 0,
      color: "bg-amber-500",
      light: "bg-amber-50",
      text: "text-amber-700",
    },
  ];

  const totalManchPosts = manchs.reduce(
    (total, manch) => total + manch.value,
    0,
  );

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  return (
    <div className="space-y-7 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <Activity size={14} />
            Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            System Overview
          </h1>

          <p className="mt-2 text-sm text-[#77716F]">
            A complete overview of your community, content, and platform
            activity.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Dashboard loaded
        </div>
      </div>

      {/* KPI GRID */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#242124]">
              Platform Statistics
            </h2>
            <p className="mt-1 text-xs text-[#88817E]">
              Key metrics across PRATIVA.
            </p>
          </div>

          <TrendingUp size={18} className="text-[#991B35]" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-medium text-[#77716F]">
                  {kpi.label}
                </span>

                <div
                  className={`shrink-0 rounded-lg p-2 ${kpi.bg} ${kpi.color}`}
                >
                  <kpi.icon size={16} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
                {formatNumber(kpi.value)}
              </p>

              {kpi.sub && (
                <p className="mt-1 text-[10px] font-semibold text-amber-700">
                  {kpi.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MANCH BREAKDOWN */}
      <section className="rounded-2xl border border-[#EBE8E5] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={17} className="text-[#991B35]" />
              <h2 className="text-base font-bold text-[#242124]">
                Manch Popularity & Content Volume
              </h2>
            </div>

            <p className="mt-1 text-xs text-[#88817E]">
              Distribution of published content across all four Manchs.
            </p>
          </div>

          <div className="w-fit rounded-xl bg-[#F8F5F3] px-3 py-2">
            <p className="text-[10px] font-medium text-[#88817E]">
              Total Manch Posts
            </p>
            <p className="text-lg font-bold text-[#242124]">
              {formatNumber(totalManchPosts)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {manchs.map((manch) => {
            const percentage =
              totalManchPosts > 0 ? (manch.value / totalManchPosts) * 100 : 0;

            return (
              <div
                key={manch.id}
                className="rounded-xl border border-[#F0EEEC] bg-[#FCFBFA] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#292426]">
                      {manch.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#99918D]">
                      {manch.subtitle}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg p-2 ${manch.light} ${manch.text}`}
                  >
                    <Layers size={16} />
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <p className="text-2xl font-bold text-[#242124]">
                    {formatNumber(manch.value)}
                  </p>
                  <p className="text-xs font-semibold text-[#88817E]">
                    {percentage.toFixed(1)}%
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEEAE7]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${manch.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-bold text-[#242124]">
            Recent Activity
          </h2>
          <p className="mt-1 text-xs text-[#88817E]">
            The latest members, creations, and moderation activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* RECENT MEMBERS */}
          <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F0EEEC] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                  <Users size={15} />
                </div>
                <h3 className="text-sm font-bold text-[#292426]">
                  Recent Members
                </h3>
              </div>

              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#991B35] hover:underline"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-0 px-5">
              {recentUsers.length === 0 ? (
                <p className="py-10 text-center text-xs text-[#99918D]">
                  No recent members found.
                </p>
              ) : (
                recentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between gap-3 border-b border-[#F3F0EE] py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#292426]">
                        {u.name}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[#99918D]">
                        {u.email}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                        u.role === "admin"
                          ? "bg-[#991B35]/10 text-[#991B35]"
                          : "bg-[#F4F1EF] text-[#77716F]"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT POSTS */}
          <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F0EEEC] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#991B35]/10 p-2 text-[#991B35]">
                  <FileText size={15} />
                </div>
                <h3 className="text-sm font-bold text-[#292426]">
                  Latest Submissions
                </h3>
              </div>

              <Link
                to="/admin/posts"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#991B35] hover:underline"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-0 px-5">
              {recentPosts.length === 0 ? (
                <p className="py-10 text-center text-xs text-[#99918D]">
                  No recent submissions found.
                </p>
              ) : (
                recentPosts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between gap-3 border-b border-[#F3F0EE] py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#292426]">
                        {p.title || "Untitled Creation"}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[#99918D]">
                        By {p.author?.name || "Creator"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-[#F8F5F3] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#77716F]">
                      {p.category || "Uncategorized"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SAFETY REPORTS */}
          <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F0EEEC] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-50 p-2 text-red-700">
                  <ShieldAlert size={15} />
                </div>
                <h3 className="text-sm font-bold text-[#292426]">
                  Safety & Moderation
                </h3>
              </div>

              <Link
                to="/admin/reports"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#991B35] hover:underline"
              >
                Review <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-0 px-5">
              {recentReports.length === 0 ? (
                <div className="flex flex-col items-center py-9 text-center">
                  <div className="rounded-full bg-emerald-50 p-3 text-emerald-700">
                    <ShieldAlert size={19} />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#48413E]">
                    No recent safety reports
                  </p>
                  <p className="mt-1 text-[10px] text-[#99918D]">
                    Your community is looking good.
                  </p>
                </div>
              ) : (
                recentReports.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center justify-between gap-3 border-b border-[#F3F0EE] py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold capitalize text-[#292426]">
                        {(r.reason || "Other").replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-[10px] text-[#99918D]">
                        Target: {r.targetType || "Unknown"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        r.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {r.status || "Unknown"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
