import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Heart,
  MessageCircle,
  FileText,
  LoaderCircle,
  Sparkles,
  Activity,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        setError("Unable to load platform analytics.");
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading analytics.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalPosts = Number(stats?.totalPosts || 0);
  const totalLikes = Number(stats?.totalLikes || 0);
  const totalComments = Number(stats?.totalComments || 0);
  const totalUsers = Number(stats?.totalUsers || 0);
  const totalCreators = Number(stats?.totalCreators || 0);

  const likesPerPost = totalPosts
    ? (totalLikes / totalPosts).toFixed(1)
    : "0.0";

  const commentsPerPost = totalPosts
    ? (totalComments / totalPosts).toFixed(1)
    : "0.0";

  const creatorConversion = totalUsers
    ? `${Math.round((totalCreators / totalUsers) * 100)}%`
    : "0%";

  const manchData = [
    {
      name: "Swar Manch",
      subtitle: "Voice",
      count: Number(stats?.manchDistribution?.voice || 0),
      color: "#991B35",
      background: "bg-[#991B35]",
      light: "bg-[#991B35]/[0.07]",
      text: "text-[#991B35]",
    },
    {
      name: "Drishya Manch",
      subtitle: "Photography",
      count: Number(stats?.manchDistribution?.vision || 0),
      color: "#2563EB",
      background: "bg-blue-600",
      light: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      name: "Rang Manch",
      subtitle: "Art",
      count: Number(stats?.manchDistribution?.art || 0),
      color: "#9333EA",
      background: "bg-purple-600",
      light: "bg-purple-50",
      text: "text-purple-700",
    },
    {
      name: "Shabda Manch",
      subtitle: "Words",
      count: Number(stats?.manchDistribution?.words || 0),
      color: "#D97706",
      background: "bg-amber-500",
      light: "bg-amber-50",
      text: "text-amber-700",
    },
  ];

  const totalManchPosts = manchData.reduce(
    (total, item) => total + item.count,
    0,
  );

  const metricCards = [
    {
      label: "Likes per post",
      value: likesPerPost,
      description: "Average appreciation per creation",
      icon: Heart,
      iconColor: "text-[#991B35]",
      iconBackground: "bg-[#991B35]/[0.08]",
      accent: "border-l-[#991B35]",
    },
    {
      label: "Comments per post",
      value: commentsPerPost,
      description: "Average discussion per creation",
      icon: MessageCircle,
      iconColor: "text-blue-600",
      iconBackground: "bg-blue-50",
      accent: "border-l-blue-500",
    },
    {
      label: "Creator conversion",
      value: creatorConversion,
      description: "Users who have created a profile",
      icon: Users,
      iconColor: "text-purple-600",
      iconBackground: "bg-purple-50",
      accent: "border-l-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#991B35]/[0.08]">
          <LoaderCircle size={28} className="animate-spin text-[#991B35]" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">
            Loading analytics
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Gathering platform insights...
          </p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <BarChart3 size={27} />
        </div>

        <h2 className="text-lg font-bold text-gray-900">
          Analytics unavailable
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">{error}</p>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#991B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7F172D]"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* PAGE INTRO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#991B35]">
              Insights & Reports
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Platform Analytics
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Understand how your community creates, connects, and engages across
            the different Manch categories.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-[#991B35]/30 hover:text-[#991B35]"
        >
          <RefreshCw size={14} />
          Refresh data
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={`rounded-2xl border border-gray-200 border-l-[3px] ${metric.accent} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconBackground}`}
                  >
                    <Icon size={19} className={metric.iconColor} />
                  </div>

                  <span className="text-sm font-semibold text-gray-600">
                    {metric.label}
                  </span>
                </div>

                <TrendingUp size={16} className="text-gray-300" />
              </div>

              <p className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
                {metric.value}
              </p>

              <p className="mt-1.5 text-xs text-gray-400">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* MANCH DISTRIBUTION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#991B35]/[0.08]">
                <PieChart size={18} className="text-[#991B35]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Manch Activity Distribution
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Breakdown of creations by category
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FAF9F7] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Total creations
            </p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">
              {totalManchPosts.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {manchData.map((manch) => {
            const percentage = totalManchPosts
              ? Math.round((manch.count / totalManchPosts) * 100)
              : 0;

            return (
              <div key={manch.name}>
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${manch.light}`}
                    >
                      <FileText size={16} className={manch.text} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {manch.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {manch.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      {manch.count.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {percentage}% of creations
                    </p>
                  </div>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${manch.background} transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {totalManchPosts === 0 && (
          <div className="mt-5 rounded-xl bg-[#FAF9F7] px-4 py-5 text-center">
            <p className="text-sm font-medium text-gray-500">
              No creations have been recorded yet.
            </p>
          </div>
        )}
      </div>

      {/* ANALYTICS NOTE */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#991B35]/10 bg-[#991B35]/[0.035] p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#991B35] shadow-sm">
          <Sparkles size={17} />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            Understanding your community
          </h4>
          <p className="mt-1 text-xs leading-6 text-gray-500">
            Engagement ratios are calculated using total platform interactions
            divided by total posts. Creator conversion represents the percentage
            of registered users who have created a profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
