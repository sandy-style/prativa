import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Trophy,
  Crown,
  Heart,
  LoaderCircle,
  ArrowRight,
  ShieldCheck,
  Flame,
  CalendarDays,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const manchTabs = [
  { id: "all", label: "All Manchs" },
  { id: "voice", label: "Swar Manch (Voice)" },
  { id: "vision", label: "Drishya Manch (Photography)" },
  { id: "art", label: "Rang Manch (Art)" },
  { id: "words", label: "Shabda Manch (Words)" },
];

const formatDate = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return "Date unavailable";
  }

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPostImage = (post) => {
  if (!post?.media) return "";

  return post.media.thumbnail || post.media.url || "";
};

const getPostTitle = (post) => {
  return (
    post?.title || post?.description || post?.content || "Untitled Creation"
  );
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("all");

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  const [event, setEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD LEADERBOARD EVENTS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/leaderboard/events`);

        if (cancelled) return;

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Unable to load Events.");
        }

        const fetchedEvents = response.data.events || [];

        setEvents(fetchedEvents);

        setSelectedEventId((current) => {
          const stillExists = fetchedEvents.some(
            (item) => item._id === current,
          );

          return stillExists ? current : fetchedEvents[0]?._id || "";
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Leaderboard events error:", err);

        setEvents([]);
        setSelectedEventId("");

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load Events. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // LOAD SELECTED EVENT LEADERBOARD
  // ==========================================

  useEffect(() => {
    if (!selectedEventId) {
      setEvent(null);
      setLeaderboard([]);
      setLoadingLeaderboard(false);
      return;
    }

    let cancelled = false;

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        setError("");

        setEvent(null);
        setLeaderboard([]);

        const response = await axios.get(`${API_URL}/api/leaderboard`, {
          params: {
            eventId: selectedEventId,
          },
        });

        if (cancelled) return;

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Unable to load this Event leaderboard.",
          );
        }

        setEvent(response.data.event || null);
        setLeaderboard(response.data.leaderboard || []);
      } catch (err) {
        if (cancelled) return;

        console.error("Leaderboard load error:", err);

        setEvent(null);
        setLeaderboard([]);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load leaderboard. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoadingLeaderboard(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  const filteredLeaderboard = useMemo(() => {
    if (activeTab === "all") {
      return leaderboard;
    }

    return leaderboard.filter((entry) => entry.post?.category === activeTab);
  }, [leaderboard, activeTab]);

  const podium = filteredLeaderboard.slice(0, 3);

  const threshold = Number(event?.likeThreshold || 1000);

  const isCompleted = event?.status === "completed";

  const isAutomatic = event?.participationMode === "automatic";

  const isFirstToLikes = event?.winningCriteria === "first_to_likes";

  const hasLikeGoal = isFirstToLikes && threshold > 0;

  const winner = event?.winner
    ? {
        user: event.winner,
        post: event.winningPost,
        totalQualifyingLikes: event.winningLikesCount || 0,
        reachedAt: event.winnerReachedAt,
        verificationStatus: event.winnerVerificationStatus,
      }
    : null;

  const getProgress = (likes) => {
    if (!hasLikeGoal) return 0;

    return Math.min(100, Math.round((Number(likes || 0) / threshold) * 100));
  };

  // ==========================================
  // PODIUM CARD
  // ==========================================

  const PodiumCard = ({ entry, position }) => {
    if (!entry?.post) return null;

    const post = entry.post;
    const author = entry.author || post?.author;

    const name = author?.name || "PRATIVA Creator";
    const userId = author?._id || author;

    const image = getPostImage(post);
    const progress = getProgress(entry.likes);

    const styles = {
      1: {
        border: "border-[#FF4DB8]",
        glow: "shadow-[0_0_35px_rgba(255,77,184,0.3)]",
        number: "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#050A30]",
        likes: "text-[#FF4DB8]",
        progress: "from-[#FF4DB8] to-[#FF789A]",
        label: "text-[#FF789A]",
      },
      2: {
        border: "border-slate-300/40",
        glow: "shadow-lg",
        number: "bg-slate-300 text-[#050A30]",
        likes: "text-[#00D4FF]",
        progress: "from-[#00D4FF] to-[#8A2BE2]",
        label: "text-[#00D4FF]",
      },
      3: {
        border: "border-[#CD7F32]/40",
        glow: "shadow-lg",
        number: "bg-[#CD7F32] text-white",
        likes: "text-[#B7FF3F]",
        progress: "from-[#B7FF3F] to-[#00D4FF]",
        label: "text-[#B7FF3F]",
      },
    };

    const style = styles[position];

    return (
      <div
        className={`relative rounded-2xl border ${style.border} bg-gradient-to-b from-[#0B1C4A] to-[#071333] p-6 text-center ${style.glow} transition hover:-translate-y-1`}
      >
        {position === 1 && (
          <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] px-4 py-1 font-['Orbitron'] text-xs font-black text-[#050A30] shadow-lg">
            <Crown size={14} />
            #1 LEADER
          </div>
        )}

        <div
          className={`mx-auto mb-4 mt-2 flex h-10 w-10 items-center justify-center rounded-full font-['Orbitron'] text-sm font-black ${style.number}`}
        >
          {position}
        </div>

        <div
          className={`mx-auto mb-4 flex w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#050A30] ${
            position === 1 ? "h-44" : "h-36"
          }`}
        >
          {image ? (
            <img
              src={image}
              alt={getPostTitle(post)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <ImageIcon size={32} />
              <span className="text-[10px]">Creative Entry</span>
            </div>
          )}
        </div>

        <p className="mb-2 truncate text-xs capitalize text-slate-400">
          {post?.category || "Creation"}
        </p>

        <h4 className="line-clamp-2 min-h-10 font-['Orbitron'] text-sm font-bold text-white">
          {getPostTitle(post)}
        </h4>

        {userId && (
          <Link
            to={`/profile/${userId}`}
            className="mt-2 inline-block text-xs text-slate-400 transition hover:text-[#FF4DB8]"
          >
            by {name}
          </Link>
        )}

        <div
          className={`mt-4 flex items-center justify-center gap-2 text-xl font-black ${style.likes}`}
        >
          <Heart size={20} className="fill-current" />
          {formatNumber(entry.likes)}
        </div>

        {hasLikeGoal && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] text-slate-400">
              <span>Goal Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[#050A30]">
              <div
                className={`h-full bg-gradient-to-r ${style.progress} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-3 text-[10px] text-slate-500">
          Published {formatDate(post?.createdAt)}
        </p>

        {post?._id && (
          <Link
            to={`/post/${post._id}`}
            className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${style.label} hover:underline`}
          >
            View Creation <ArrowRight size={13} />
          </Link>
        )}
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#050A30] text-white">
      {/* HERO HEADER */}

      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#091645] to-[#050A30] py-14 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#FF4DB8]/15 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/40 bg-[#FF4DB8]/10 px-4 py-1 font-['Orbitron'] text-xs font-semibold text-[#FF789A]">
            <Trophy size={14} className="text-[#FF4DB8]" />
            PRATIVA EVENT LEADERBOARD
          </div>

          <h1 className="mt-5 font-['Orbitron'] text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {hasLikeGoal ? (
              <>
                THE RACE TO{" "}
                <span className="bg-gradient-to-r from-[#FF4DB8] via-[#FF789A] to-[#00D4FF] bg-clip-text text-transparent">
                  {formatNumber(threshold)} LIKES
                </span>
              </>
            ) : (
              <>
                THE{" "}
                <span className="bg-gradient-to-r from-[#FF4DB8] via-[#FF789A] to-[#00D4FF] bg-clip-text text-transparent">
                  LEADERBOARD
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Every creation has a chance to shine. Discover the leading posts,
            support your favorite creators, and follow the journey to the top of
            PRATIVA.
          </p>

          {/* EVENT SELECTOR */}

          {!loadingEvents && events.length > 0 && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <span className="text-xs text-slate-400">Select Event</span>

              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full max-w-md cursor-pointer rounded-full border border-white/10 bg-[#0B1F6B] px-5 py-3 text-sm font-medium text-white outline-none focus:border-[#FF4DB8]"
              >
                {events.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                    {item.status === "completed" ? " (Completed)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* EVENT INFORMATION */}

          {event && (
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-4 py-2 text-xs text-[#00D4FF]">
                <Flame size={14} />
                {isAutomatic ? "Automatic Participation" : "Registered Event"}
              </span>

              {hasLikeGoal ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                  <Heart size={14} />
                  {formatNumber(threshold)} Likes Goal
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                  <Heart size={14} />
                  Highest Qualifying Likes Wins
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                <CalendarDays size={14} />
                {formatDate(event.startDate)} – {formatDate(event.endDate)}
              </span>

              {Number(event.prizeAmount) > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-4 py-2 text-xs font-semibold text-[#FFD700]">
                  <Trophy size={14} />
                  {event.prizeCurrency || "NPR"}{" "}
                  {formatNumber(event.prizeAmount)} Prize
                </span>
              )}

              {!Number(event.prizeAmount) && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/30 bg-[#FF4DB8]/10 px-4 py-2 text-xs text-[#FF789A]">
                  <Sparkles size={14} />
                  Exclusive Rewards
                </span>
              )}

              {isCompleted && (
                <span className="rounded-full border border-slate-400/30 bg-slate-400/10 px-4 py-2 text-xs text-slate-300">
                  Event Completed
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* WINNER SHOWCASE */}

      {winner && (
        <section className="border-b border-[#FF4DB8]/30 bg-gradient-to-r from-[#FF4DB8]/10 via-[#8A2BE2]/10 to-[#FF4DB8]/10 py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-[#FF4DB8]/50 bg-[#09153D]/90 p-6 shadow-[0_0_40px_rgba(255,77,184,0.25)] sm:flex-row sm:p-8">
              <div className="flex items-center gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[#FFD700] bg-[#FF4DB8]/20 text-2xl font-bold text-white shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                  {winner.user?.name?.[0] || "W"}

                  <div className="absolute -right-2 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#FFD700] to-[#FFA500] text-[#050A30] shadow-lg">
                    <Crown size={18} />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD700]/20 px-3 py-0.5 text-[10px] font-bold text-[#FFD700]">
                    <ShieldCheck size={12} />

                    {winner.verificationStatus === "verified"
                      ? "VERIFIED CHAMPION"
                      : winner.verificationStatus === "rejected"
                        ? "WINNER UNDER REVIEW"
                        : "WINNER PENDING VERIFICATION"}
                  </div>

                  <h3 className="mt-2 font-['Orbitron'] text-xl font-bold text-white">
                    {winner.user?.name || "Platform Winner"}
                  </h3>

                  <p className="mt-1 text-xs text-[#A7B5D8]">
                    {formatNumber(winner.totalQualifyingLikes)} qualifying likes
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Winner declared {formatDateTime(winner.reachedAt)}
                  </p>
                </div>
              </div>

              {winner.user?._id && (
                <Link
                  to={`/profile/${winner.user._id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-6 py-2.5 font-['Orbitron'] text-xs font-bold text-white shadow-[0_0_20px_rgba(255,77,184,0.3)] transition hover:scale-105"
                >
                  View Champion Profile
                  <ArrowRight size={14} />
                </Link>
              )}

              {winner.post?._id && (
                <Link
                  to={`/post/${winner.post._id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-[#FF4DB8] hover:text-[#FF4DB8]"
                >
                  Winning Creation
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* CATEGORY FILTERS */}

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {manchTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] text-white shadow-[0_0_15px_rgba(255,77,184,0.3)]"
                  : "border border-white/10 bg-[#071333] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING */}

        {(loadingEvents || loadingLeaderboard) && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <LoaderCircle size={36} className="animate-spin text-[#FF4DB8]" />

            <p className="mt-4 font-['Orbitron'] text-xs uppercase tracking-widest">
              Calculating Event Standings...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loadingEvents && !loadingLeaderboard && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                if (selectedEventId) {
                  setSelectedEventId("");
                  setTimeout(() => {
                    setSelectedEventId(selectedEventId);
                  }, 0);
                } else {
                  window.location.reload();
                }
              }}
              className="mt-4 rounded-full border border-red-400/30 px-5 py-2 text-xs font-semibold transition hover:bg-red-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* NO EVENTS */}

        {!loadingEvents &&
          !loadingLeaderboard &&
          !error &&
          events.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#071333] p-12 text-center">
              <Trophy size={48} className="mx-auto mb-3 text-slate-600" />

              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                No Leaderboard Events Yet
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                New Events will appear here when they are published. Stay
                creative and keep an eye out!
              </p>
            </div>
          )}

        {/* EMPTY LEADERBOARD */}

        {!loadingEvents &&
          !loadingLeaderboard &&
          !error &&
          events.length > 0 &&
          filteredLeaderboard.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#071333] p-12 text-center">
              <Trophy size={48} className="mx-auto mb-3 text-slate-600" />

              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                No Qualifying Posts Yet
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                Eligible creations will appear here as they receive qualifying
                likes.
              </p>
            </div>
          )}

        {/* LEADERBOARD */}

        {!loadingEvents &&
          !loadingLeaderboard &&
          !error &&
          filteredLeaderboard.length > 0 && (
            <>
              {/* PODIUM */}

              {podium.length > 0 && (
                <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end">
                  {podium[1] && (
                    <div className="order-2 md:order-1">
                      <PodiumCard entry={podium[1]} position={2} />
                    </div>
                  )}

                  {podium[0] && (
                    <div className="order-1 md:order-2 md:-translate-y-4">
                      <PodiumCard entry={podium[0]} position={1} />
                    </div>
                  )}

                  {podium[2] && (
                    <div className="order-3 md:order-3">
                      <PodiumCard entry={podium[2]} position={3} />
                    </div>
                  )}
                </div>
              )}

              {/* FULL RANKINGS */}

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071333]">
                <div className="flex flex-col justify-between gap-2 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-['Orbitron'] text-base font-bold text-white">
                      Event Standings
                    </h3>

                    <p className="text-xs text-slate-400">
                      Each creation is ranked independently by qualifying likes.
                    </p>
                  </div>

                  <span className="text-xs text-[#00D4FF]">
                    {filteredLeaderboard.length} eligible posts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left text-xs">
                    <thead className="border-b border-white/10 bg-[#050A30] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3.5 pl-6 pr-3">Rank</th>
                        <th className="px-3 py-3.5">Creation</th>
                        <th className="px-3 py-3.5">Creator</th>
                        <th className="px-3 py-3.5">Manch</th>
                        <th className="px-3 py-3.5">Qualifying Likes</th>

                        {hasLikeGoal && (
                          <th className="px-3 py-3.5">Goal Progress</th>
                        )}

                        <th className="py-3.5 pl-3 pr-6 text-right">View</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {filteredLeaderboard.map((entry) => {
                        const post = entry.post;

                        if (!post?._id) return null;

                        const author = entry.author || post?.author;

                        const userId = author?._id || author;
                        const image = getPostImage(post);
                        const progress = getProgress(entry.likes);

                        return (
                          <tr
                            key={post._id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="py-4 pl-6 pr-3 font-['Orbitron'] font-bold">
                              {entry.rank === 1 ? (
                                <span className="text-[#FFD700]">🥇 #1</span>
                              ) : entry.rank === 2 ? (
                                <span className="text-slate-300">🥈 #2</span>
                              ) : entry.rank === 3 ? (
                                <span className="text-[#CD7F32]">🥉 #3</span>
                              ) : (
                                <span className="text-slate-400">
                                  #{entry.rank}
                                </span>
                              )}
                            </td>

                            <td className="px-3 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0B1F6B]">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={getPostTitle(post)}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <ImageIcon
                                        size={18}
                                        className="text-slate-500"
                                      />
                                    </div>
                                  )}
                                </div>

                                <p className="max-w-48 truncate font-semibold text-white">
                                  {getPostTitle(post)}
                                </p>
                              </div>
                            </td>

                            <td className="px-3 py-4">
                              {userId ? (
                                <Link
                                  to={`/profile/${userId}`}
                                  className="font-semibold text-white transition hover:text-[#FF4DB8]"
                                >
                                  {author?.name || "Creator"}
                                </Link>
                              ) : (
                                <span className="text-slate-400">Creator</span>
                              )}
                            </td>

                            <td className="px-3 py-4 capitalize text-slate-300">
                              {post?.category || "—"}
                            </td>

                            <td className="px-3 py-4 font-semibold text-[#FF4DB8]">
                              <span className="inline-flex items-center gap-1.5">
                                <Heart size={13} className="fill-current" />
                                {formatNumber(entry.likes)}
                              </span>
                            </td>

                            {hasLikeGoal && (
                              <td className="w-48 px-3 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-[#050A30]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FF4DB8]"
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="text-[10px] text-slate-400">
                                    {progress}%
                                  </span>
                                </div>
                              </td>
                            )}

                            <td className="py-4 pl-3 pr-6 text-right">
                              <Link
                                to={`/post/${post._id}`}
                                className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-[#FF4DB8] hover:text-[#FF4DB8]"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
      </main>
    </div>
  );
};

export default Leaderboard;
