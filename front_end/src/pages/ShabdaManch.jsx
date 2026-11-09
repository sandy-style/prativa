import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useNavigationType } from "react-router-dom";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  PenLine,
  X,
  AlertCircle,
} from "lucide-react";

import shabdaHero from "../assets/shabdahero.png";
import shabdalogo from "../assets/shabdalogo.png";

import { useAuth } from "../context/AuthContext";

import ShabdaFeed from "../components/shabda/ShabdaFeed";
import ShabdaUpload from "../components/shabda/ShabdaUpload";
import ShabdaPostDetails from "../components/shabda/ShabdaPostDetail";
import ShabdaNavbar from "../components/shabda/ShabdaNavbar";
import CreateProfile from "../components/CreateProfile";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const PAGE_LIMIT = 30;

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "most-liked", label: "Most loved" },
  { value: "most-discussed", label: "Most discussed" },
];

// ==========================================
// SHABDA INTRO LOADER
// ==========================================

const ShabdaIntroLoader = () => (
  <div className="shabda-loader fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-hidden bg-[#140D08]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F97316]/[0.16] blur-[120px]" />
      <div className="absolute left-[15%] top-[20%] h-48 w-48 rounded-full bg-[#FB923C]/10 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[12%] h-56 w-56 rounded-full bg-[#EA580C]/10 blur-[110px]" />

      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(249,115,22,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.3)_1px,transparent_1px)] [background-size:70px_70px]" />
    </div>

    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
        <div className="shabda-outer-ring absolute inset-0 rounded-full border border-dashed border-[#F97316]/60" />
        <div className="shabda-middle-ring absolute inset-3 rounded-full border border-[#FB923C]/40" />

        <div className="absolute inset-7 rounded-full border border-[#F97316]/30 bg-[#24170F] shadow-[0_0_55px_rgba(249,115,22,0.22)]" />

        <img
          src={shabdalogo}
          alt="Shabda Manch"
          className="shabda-aperture relative z-10 h-16 w-16 object-contain drop-shadow-[0_0_18px_rgba(249,115,22,0.45)]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-[#FB923C]">
          <BookOpen size={16} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">
            PRATIVA
          </span>
        </div>

        <h1 className="font-[Orbitron] text-3xl font-semibold tracking-[0.1em] text-[#FFF3E8] sm:text-4xl">
          SHABDA <span className="text-[#F97316]">MANCH</span>
        </h1>

        <p className="text-sm text-[#B9A18D]">Every word carries a world.</p>
      </div>

      <div className="mt-10 w-44">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#A9917C]">
            Turning thoughts into words
          </span>
          <BookOpen size={14} className="text-[#FB923C]" />
        </div>

        <div className="h-[3px] overflow-hidden rounded-full bg-[#F97316]/15">
          <div className="shabda-progress h-full rounded-full bg-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
        </div>
      </div>
    </div>

    <style>{`
      .shabda-loader {
        animation: shabdaFadeIn 0.4s ease-out both;
      }

      .shabda-outer-ring {
        animation: shabdaRotate 12s linear infinite;
      }

      .shabda-middle-ring {
        animation: shabdaRotateReverse 8s linear infinite;
      }

      .shabda-aperture {
        animation: shabdaPulse 2s ease-in-out infinite;
      }

      .shabda-progress {
        width: 35%;
        animation: shabdaProgress 1.7s ease-in-out infinite;
      }

      @keyframes shabdaRotate {
        to { transform: rotate(360deg); }
      }

      @keyframes shabdaRotateReverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }

      @keyframes shabdaPulse {
        0%, 100% {
          transform: scale(0.94);
          opacity: 0.75;
        }
        50% {
          transform: scale(1.06);
          opacity: 1;
        }
      }

      @keyframes shabdaProgress {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(390%); }
      }

      @keyframes shabdaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .shabda-outer-ring,
        .shabda-middle-ring,
        .shabda-aperture,
        .shabda-progress {
          animation: none;
        }
      }
    `}</style>
  </div>
);

// ==========================================
// SHABDA MANCH PAGE
// ==========================================

const ShabdaManch = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const {
    isAuthenticated,
    hasProfile,
    loading: authLoading,
    profileLoading,
    user,
    refreshProfile,
  } = useAuth();

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showIntroLoader, setShowIntroLoader] = useState(
    navigationType === "PUSH",
  );

  const [introMinimumElapsed, setIntroMinimumElapsed] = useState(false);

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  const currentUserId =
    user?._id ||
    user?.id ||
    user?.userId ||
    user?.user?._id ||
    user?.user?.id ||
    null;

  // ==========================================
  // INTRO LOADER TIMING
  // ==========================================

  useEffect(() => {
    if (!showIntroLoader) return;

    const timer = window.setTimeout(() => {
      setIntroMinimumElapsed(true);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [showIntroLoader]);

  useEffect(() => {
    if (showIntroLoader && !loading && introMinimumElapsed) {
      setShowIntroLoader(false);
    }
  }, [showIntroLoader, loading, introMinimumElapsed]);

  // ==========================================
  // UPLOAD AUTHENTICATION
  // ==========================================

  const handleUploadClick = () => {
    if (authLoading || profileLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!hasProfile) {
      setShowCreateProfile(true);
      return;
    }

    setShowUpload(true);
  };

  const handleProfileCreated = async () => {
    try {
      await refreshProfile();
      setShowCreateProfile(false);
      setShowUpload(true);
    } catch (err) {
      console.error(
        "Profile refresh failed:",
        err?.response?.data?.message || err.message,
      );
    }
  };

  // ==========================================
  // FETCH WRITTEN POSTS
  // ==========================================

  const fetchPosts = useCallback(
    async ({ pageNumber = 1, append = false } = {}) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        if (!API_URL) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const response = await axios.get(`${API_URL}/api/post/feed`, {
          params: {
            category: "words",
            sort,
            page: pageNumber,
            limit: PAGE_LIMIT,
          },
          withCredentials: true,
        });

        if (!response?.data?.success) {
          throw new Error(
            response?.data?.message || "Unable to load written posts.",
          );
        }

        const fetchedPosts = response?.data?.posts || [];
        const pagination = response?.data?.pagination || {};

        const formattedPosts = fetchedPosts.map((post) => ({
          ...post,
          likesCount: Number(post.likesCount) || 0,
          commentsCount: Number(post.commentsCount) || 0,
        }));

        setPosts((previous) =>
          append
            ? [
                ...previous,
                ...formattedPosts.filter(
                  (post) =>
                    !previous.some((existing) => existing._id === post._id),
                ),
              ]
            : formattedPosts,
        );

        setPage(pageNumber);
        setHasMore(Boolean(pagination.hasMore));
        setTotalPosts(Number(pagination.total) || 0);
      } catch (err) {
        console.error("ShabdaManch feed error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong while loading ShabdaManch.",
        );

        if (!append) {
          setPosts([]);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort],
  );

  useEffect(() => {
    fetchPosts({ pageNumber: 1 });
  }, [fetchPosts, refreshKey]);

  // ==========================================
  // LOAD MORE
  // ==========================================

  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;

    fetchPosts({
      pageNumber: page + 1,
      append: true,
    });
  };

  // ==========================================
  // CREATE POST
  // ==========================================

  const handlePostCreated = (newPost) => {
    if (!newPost?._id) return;

    const formattedPost = {
      ...newPost,
      likesCount: Number(newPost.likesCount) || 0,
      commentsCount: Number(newPost.commentsCount) || 0,
      isLiked: false,
      isSaved: false,
    };

    setPosts((previous) => [
      formattedPost,
      ...previous.filter((post) => post._id !== newPost._id),
    ]);

    setTotalPosts((previous) => previous + 1);
    setShowUpload(false);
  };

  // ==========================================
  // UPDATE POST
  // ==========================================

  const handlePostUpdated = (updatedPost) => {
    if (!updatedPost?._id) return;

    setPosts((previous) =>
      previous.map((post) =>
        post._id === updatedPost._id ? { ...post, ...updatedPost } : post,
      ),
    );

    setSelectedPost((previous) =>
      previous?._id === updatedPost._id
        ? { ...previous, ...updatedPost }
        : previous,
    );
  };

  // ==========================================
  // POST DETAILS
  // ==========================================

  const handlePostSelect = (post) => {
    if (!post?._id) return;
    setSelectedPost(post);
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return posts;

    return posts.filter((post) => {
      const searchableText = [
        post.title,
        post.description,
        post.content,
        post.caption,
        ...(Array.isArray(post.tags) ? post.tags : []),
        post.author?.name,
        post.authorProfile?.username,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [posts, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-[#17100B] text-[#FFF3E8]">
        {/* NAVBAR */}
        <ShabdaNavbar
          onUpload={handleUploadClick}
          uploadingDisabled={authLoading || profileLoading}
        />

        {/* HERO */}
        <section className="relative w-full overflow-hidden bg-[#1C100A]">
          <img
            src={shabdaHero}
            alt="Shabda Manch"
            className="block h-auto max-h-[350px] min-h-[240px] w-full object-cover object-center"
          />

          {/* HEAVY LEFT VIGNETTE */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(12,7,4,1)_0%,rgba(18,10,6,0.99)_18%,rgba(23,16,11,0.92)_38%,rgba(23,16,11,0.68)_58%,rgba(23,16,11,0.25)_78%,transparent_100%)]" />

          {/* DARK BOTTOM VIGNETTE */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(12,7,4,0.85)_0%,rgba(23,16,11,0.35)_35%,transparent_70%)]" />

          {/* DARK TOP VIGNETTE */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,7,4,0.35)_0%,transparent_35%)]" />

          {/* SUBTLE ORANGE GLOW */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#F97316]/15 blur-[100px]" />
          <div className="pointer-events-none absolute right-[15%] top-0 h-48 w-48 rounded-full bg-[#FB923C]/10 blur-[90px]" />

          <div className="absolute inset-0 flex items-center gap-4 px-5 sm:gap-7 sm:px-10 md:px-16 lg:px-20">
            <div className="flex shrink-0 items-center justify-center">
              <img
                src={shabdalogo}
                alt="Shabda Manch Logo"
                className="h-20 w-20 object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.4)] sm:h-28 sm:w-28 md:h-36 md:w-36 lg:h-40 lg:w-40"
              />
            </div>

            <div className="flex min-w-0 flex-col">
              <p className="mt-2 font-[Orbitron] text-[9px] font-semibold tracking-[0.2em] text-[#FDBA74] sm:mt-3 sm:text-xs md:text-sm">
                THERE IS A POET IN YOU
              </p>

              <h1 className="font-[Orbitron] text-4xl font-bold uppercase leading-[0.95] tracking-[-0.04em] text-[#FFF7ED] sm:text-5xl md:text-7xl lg:text-8xl">
                Shabda
                <br />
                <span className="text-[#FB923C] drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  Manch.
                </span>
              </h1>

              <p className="mt-3 font-[Orbitron] text-[9px] font-semibold tracking-[0.15em] text-[#E7B38C] sm:mt-4 sm:text-xs md:text-sm">
                EVERY WORD CARRIES A WORLD.
              </p>
            </div>
          </div>
        </section>

        {/* WRITTEN COLLECTION */}
        <section
          id="shabda-feed"
          className="mx-auto max-w-[1800px] scroll-mt-20 px-4 pb-10 pt-5 sm:px-6 lg:px-9"
        >
          {/* CATEGORY + WRITE */}
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                className="shrink-0 rounded-full border border-[#F97316]/70 bg-[#F97316] px-5 py-2 text-[12px] font-semibold text-white shadow-[0_0_18px_rgba(249,115,22,0.2)]"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={14} />
                  All writings
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={authLoading || profileLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#F97316]/60 bg-[#2A1B11] px-6 py-2.5 text-[12px] font-semibold text-[#FDBA74] shadow-[0_0_14px_rgba(249,115,22,0.06)] transition hover:border-[#FB923C] hover:bg-[#F97316] hover:text-white hover:shadow-[0_0_22px_rgba(249,115,22,0.3)] disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
            >
              <PenLine size={15} />
              Write something
            </button>
          </div>

          {/* SEARCH + SORT */}
          <div className="mb-5 flex flex-col gap-4 border-b border-[#F97316]/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {/* SEARCH */}
              <div className="relative w-full sm:w-[260px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FB923C]"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search writings..."
                  className="h-10 w-full rounded-lg border border-[#F97316]/20 bg-[#24180F] pl-10 pr-9 text-xs text-[#FFF3E8] outline-none transition placeholder:text-[#A9917C] focus:border-[#FB923C]/70 focus:ring-2 focus:ring-[#F97316]/10"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9917C] transition hover:text-[#FB923C]"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* SORT */}
              <div className="relative flex h-10 shrink-0 items-center rounded-lg border border-[#F97316]/20 bg-[#24180F] pl-3">
                <SlidersHorizontal size={14} className="mr-2 text-[#FB923C]" />

                <select
                  id="shabda-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-full appearance-none bg-transparent pr-9 text-xs text-[#EBD5C2] outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#24180F]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 text-[#FB923C]"
                />
              </div>
            </div>
          </div>

          {/* RESULTS COUNT */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] text-[#B9A18D]">
              {loading
                ? "Discovering writings..."
                : `${filteredPosts.length} writings`}

              {!loading && totalPosts > 0 && (
                <span className="ml-1 text-[#8F7A68]">
                  / {totalPosts.toLocaleString()} published
                </span>
              )}
            </p>

            {searchQuery && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-medium text-[#FB923C] transition hover:text-[#FDBA74]"
              >
                Clear search
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && !loading && (
            <div className="mb-5 flex flex-col items-center gap-3 rounded-xl border border-[#F97316]/20 bg-[#24180F] px-5 py-7 text-center shadow-[0_0_25px_rgba(249,115,22,0.04)]">
              <div className="flex items-center gap-2 text-[#FB923C]">
                <AlertCircle size={17} />
                <p className="text-sm font-semibold text-[#FFF3E8]">
                  Couldn't load Shabda Manch
                </p>
              </div>

              <p className="text-xs text-[#B9A18D]">{error}</p>

              <button
                type="button"
                onClick={() => setRefreshKey((previous) => previous + 1)}
                className="flex items-center gap-2 text-xs font-semibold text-[#FB923C] transition hover:text-[#FDBA74]"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          )}

          {/* WRITING FEED */}
          <div className="min-h-[300px]">
            <ShabdaFeed
              posts={filteredPosts}
              loading={loading}
              onPostSelect={handlePostSelect}
              onLike={handlePostSelect}
              onComment={handlePostSelect}
              onSave={handlePostSelect}
            />

            {/* SEARCH EMPTY STATE */}
            {!loading && posts.length > 0 && filteredPosts.length === 0 && (
              <div className="py-16 text-center">
                <Search size={30} className="mx-auto mb-3 text-[#FB923C]/60" />

                <p className="text-xl font-semibold text-[#FFF3E8]">
                  No writings found.
                </p>

                <p className="mt-2 text-xs text-[#B9A18D]">
                  Try another search term.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border border-[#F97316]/35 bg-[#24180F] px-4 py-2 text-xs font-semibold text-[#FDBA74] transition hover:bg-[#F97316] hover:text-white hover:shadow-[0_0_18px_rgba(249,115,22,0.2)]"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && posts.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#F97316]/25 bg-[#2A1B11] shadow-[0_0_25px_rgba(249,115,22,0.1)]">
                  <BookOpen size={29} className="text-[#FB923C]" />
                </div>

                <p className="font-[Orbitron] text-xl font-semibold text-[#FFF3E8]">
                  The first page is waiting.
                </p>

                <p className="mt-2 text-xs text-[#B9A18D]">
                  Be the first to share a poem, story, or thought.
                </p>

                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-5 py-3 text-xs font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition hover:bg-[#EA650F] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)]"
                >
                  <PenLine size={15} />
                  Write the first post
                </button>
              </div>
            )}
          </div>

          {/* LOAD MORE */}
          {!loading && !error && hasMore && filteredPosts.length > 0 && (
            <div className="flex justify-center pt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-full border border-[#F97316]/25 bg-[#24180F] px-6 py-2.5 text-xs font-semibold text-[#FDBA74] transition hover:border-[#FB923C]/60 hover:bg-[#2F1E12] hover:shadow-[0_0_18px_rgba(249,115,22,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore && (
                  <LoaderCircle size={14} className="animate-spin" />
                )}

                {loadingMore ? "Loading..." : "Load more writings"}
              </button>
            </div>
          )}
        </section>

        {/* FLOATING WRITE BUTTON */}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={authLoading || profileLoading}
          aria-label="Write something"
          className="fixed bottom-6 right-5 z-40 flex h-12 items-center gap-2 rounded-full border border-[#FDBA74]/50 bg-[#F97316] px-5 text-xs font-semibold text-white shadow-[0_0_22px_rgba(249,115,22,0.3)] transition hover:-translate-y-1 hover:bg-[#EA650F] hover:shadow-[0_0_30px_rgba(249,115,22,0.45)] disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-8 sm:right-8"
        >
          <PenLine size={16} />
          Write
        </button>

        {/* CREATE PROFILE */}
        {showCreateProfile && (
          <CreateProfile
            onClose={() => setShowCreateProfile(false)}
            onSuccess={handleProfileCreated}
          />
        )}

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#100905]/85 backdrop-blur-md">
            <div className="min-h-screen">
              <ShabdaUpload
                onClose={() => setShowUpload(false)}
                onPostCreated={handlePostCreated}
              />
            </div>
          </div>
        )}

        {/* POST DETAILS MODAL */}
        {selectedPost && (
          <ShabdaPostDetails
            key={selectedPost._id}
            post={selectedPost}
            onClose={handleCloseDetails}
            onPostUpdated={handlePostUpdated}
            currentUserId={currentUserId}
          />
        )}
      </main>

      {/* INTRO LOADER */}
      {showIntroLoader && <ShabdaIntroLoader />}
    </>
  );
};

export default ShabdaManch;
