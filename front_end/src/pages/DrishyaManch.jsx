import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useNavigationType } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  Camera,
  Aperture,
  Focus,
  Images,
  X,
} from "lucide-react";

import drishyaHero from "../assets/drishyahero.png";

import { useAuth } from "../context/AuthContext";
import DrishyaGrid from "../components/drishya/DrishyaGrid";
import DrishyaUpload from "../components/drishya/DrishyaUpload";
import DrishyaNavbar from "../components/drishya/DrishyaNavbar";
import CreateProfile from "../components/CreateProfile";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const categories = [
  "All photographs",
  "Nature",
  "Architecture",
  "People",
  "Travel",
  "Street",
  "Wildlife",
];

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Most liked", value: "most-liked" },
  { label: "Most discussed", value: "most-discussed" },
];

const demoPosts = [
  {
    _id: "demo-01",
    category: "vision",
    title: "Where the mountains meet the clouds",
    description: "A quiet morning in the Himalayas.",
    tags: ["nature", "travel"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",
    },
    author: { name: "Aarav Sharma" },
    authorProfile: {
      username: "aarav.frames",
      profileImage: "https://i.pravatar.cc/150?img=12",
    },
    likesCount: 248,
    commentsCount: 32,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-11-05T08:00:00.000Z",
  },
  {
    _id: "demo-02",
    category: "vision",
    title: "The old streets",
    description: "Little moments hidden in the streets of Bhaktapur.",
    tags: ["architecture", "street"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=900",
    },
    author: { name: "Mira Thapa" },
    authorProfile: {
      username: "mirasees",
      profileImage: "https://i.pravatar.cc/150?img=47",
    },
    likesCount: 184,
    commentsCount: 18,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-11-04T08:00:00.000Z",
  },
  {
    _id: "demo-03",
    category: "vision",
    title: "A little closer to nature",
    description: "The beauty of the smallest details.",
    tags: ["nature", "wildlife"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900",
    },
    author: { name: "Nischal Karki" },
    authorProfile: {
      username: "nischal.clicks",
      profileImage: "https://i.pravatar.cc/150?img=11",
    },
    likesCount: 321,
    commentsCount: 45,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-11-03T08:00:00.000Z",
  },
  {
    _id: "demo-04",
    category: "vision",
    title: "The golden hour",
    description: "Some evenings deserve to be remembered.",
    tags: ["travel", "nature"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900",
    },
    author: { name: "Sanjana Rai" },
    authorProfile: {
      username: "sanjana.visuals",
      profileImage: "https://i.pravatar.cc/150?img=44",
    },
    likesCount: 412,
    commentsCount: 57,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-11-02T08:00:00.000Z",
  },
  {
    _id: "demo-05",
    category: "vision",
    title: "Quiet corners of the city",
    description: "Finding stories in ordinary places.",
    tags: ["street", "architecture"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900",
    },
    author: { name: "Rohan Gurung" },
    authorProfile: {
      username: "rohan.capture",
      profileImage: "https://i.pravatar.cc/150?img=13",
    },
    likesCount: 156,
    commentsCount: 12,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-11-01T08:00:00.000Z",
  },
  {
    _id: "demo-06",
    category: "vision",
    title: "Into the wild",
    description: "A moment with the untamed world.",
    tags: ["wildlife", "nature"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=900",
    },
    author: { name: "Prakriti Joshi" },
    authorProfile: {
      username: "prakriti.nature",
      profileImage: "https://i.pravatar.cc/150?img=45",
    },
    likesCount: 289,
    commentsCount: 26,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-10-31T08:00:00.000Z",
  },
  {
    _id: "demo-07",
    category: "vision",
    title: "A different perspective",
    description: "Looking at familiar places differently.",
    tags: ["architecture", "travel"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=900",
    },
    author: { name: "Sujal Bista" },
    authorProfile: {
      username: "sujal.jpg",
      profileImage: "https://i.pravatar.cc/150?img=14",
    },
    likesCount: 197,
    commentsCount: 21,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-10-30T08:00:00.000Z",
  },
  {
    _id: "demo-08",
    category: "vision",
    title: "The beauty of everyday life",
    description: "A photograph of an ordinary, beautiful moment.",
    tags: ["people", "street"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900",
    },
    author: { name: "Anisha KC" },
    authorProfile: {
      username: "anisha.frames",
      profileImage: "https://i.pravatar.cc/150?img=48",
    },
    likesCount: 134,
    commentsCount: 9,
    isLiked: false,
    isDemo: true,
    createdAt: "2026-10-29T08:00:00.000Z",
  },
];

// ==========================================
// INTRO LOADER
// ==========================================

const DrishyaIntroLoader = () => (
  <div className="drishya-loader fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-hidden bg-[#030A17]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D4FF]/[0.07] blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(0,212,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
    </div>

    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      <div className="relative mb-9 flex h-32 w-32 items-center justify-center">
        <div className="drishya-outer-ring absolute inset-0 rounded-full border border-dashed border-[#00D4FF]/30" />
        <div className="drishya-middle-ring absolute inset-3 rounded-full border border-[#00D4FF]/20" />
        <div className="absolute inset-7 rounded-full border border-[#00D4FF]/40 bg-[#07182A] shadow-[0_0_45px_rgba(0,212,255,0.12)]" />

        <Aperture
          size={55}
          strokeWidth={1.2}
          className="drishya-aperture relative z-10 text-[#00D4FF]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-[#00D4FF]">
          <Camera size={16} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">
            PRATIVA
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-[0.1em] text-white sm:text-4xl">
          DRISHYA <span className="text-[#00D4FF]">MANCH</span>
        </h1>

        <p className="text-sm text-slate-400">Every frame tells a story.</p>
      </div>

      <div className="mt-10 w-44">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
            Capturing moments
          </span>
          <Focus size={13} className="text-[#00D4FF]" />
        </div>

        <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
          <div className="drishya-progress h-full rounded-full bg-[#00D4FF]" />
        </div>
      </div>
    </div>

    <style>{`
      .drishya-loader {
        animation: drishyaFadeIn 0.4s ease-out both;
      }

      .drishya-outer-ring {
        animation: drishyaRotate 12s linear infinite;
      }

      .drishya-middle-ring {
        animation: drishyaRotateReverse 8s linear infinite;
      }

      .drishya-aperture {
        animation: drishyaPulse 2s ease-in-out infinite;
      }

      .drishya-progress {
        width: 35%;
        animation: drishyaProgress 1.7s ease-in-out infinite;
      }

      @keyframes drishyaRotate {
        to { transform: rotate(360deg); }
      }

      @keyframes drishyaRotateReverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }

      @keyframes drishyaPulse {
        0%, 100% { transform: scale(0.94); opacity: 0.75; }
        50% { transform: scale(1.06); opacity: 1; }
      }

      @keyframes drishyaProgress {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(390%); }
      }

      @keyframes drishyaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .drishya-outer-ring,
        .drishya-middle-ring,
        .drishya-aperture,
        .drishya-progress {
          animation: none;
        }
      }
    `}</style>
  </div>
);

// ==========================================
// DRISHYA MANCH PAGE
// ==========================================

const DrishyaManch = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const {
    isAuthenticated,
    hasProfile,
    loading: authLoading,
    profileLoading,
    refreshProfile,
  } = useAuth();

  const [posts, setPosts] = useState(demoPosts);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showIntroLoader, setShowIntroLoader] = useState(
    navigationType === "PUSH",
  );
  const [introMinimumElapsed, setIntroMinimumElapsed] = useState(false);

  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All photographs");
  const [sort, setSort] = useState("latest");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const likingPosts = useRef(new Set());

  // Intro timing
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
    } catch (error) {
      console.error(
        "Profile refresh failed:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ==========================================
  // FETCH GALLERY
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchGallery = async () => {
      setLoading(true);
      setError("");
      setLoadMoreError("");
      setPage(1);
      setHasMore(false);

      try {
        if (!API_URL) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const params = {
          category: "vision",
          sort,
          page: 1,
          limit: 30,
        };

        if (activeCategory !== "All photographs") {
          params.tag = activeCategory.toLowerCase();
        }

        const response = await axios.get(`${API_URL}/api/post/feed`, {
          params,
          withCredentials: true,
        });

        if (cancelled) return;

        const fetchedPosts = response.data.posts || [];

        if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
          setIsDemoMode(false);
          setHasMore(Boolean(response.data.pagination?.hasMore));
        } else {
          setPosts(demoPosts);
          setIsDemoMode(true);
        }
      } catch (err) {
        if (cancelled) return;

        console.warn("Using Drishya demo content:", err.message);
        setPosts(demoPosts);
        setIsDemoMode(true);
        setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGallery();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, sort, refreshKey]);

  // ==========================================
  // LOAD MORE
  // ==========================================

  const handleLoadMore = async () => {
    if (loadingMore || loading || !hasMore || isDemoMode) return;

    const nextPage = page + 1;

    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const params = {
        category: "vision",
        sort,
        page: nextPage,
        limit: 30,
      };

      if (activeCategory !== "All photographs") {
        params.tag = activeCategory.toLowerCase();
      }

      const response = await axios.get(`${API_URL}/api/post/feed`, {
        params,
        withCredentials: true,
      });

      const newPosts = response.data.posts || [];

      setPosts((previous) => {
        const existingIds = new Set(previous.map((post) => post._id));

        return [
          ...previous,
          ...newPosts.filter((post) => !existingIds.has(post._id)),
        ];
      });

      setPage(nextPage);
      setHasMore(Boolean(response.data.pagination?.hasMore));
    } catch (err) {
      console.error("Unable to load more photographs:", err);

      setLoadMoreError(
        err.response?.data?.message ||
          "Unable to load more photographs. Please try again.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // ==========================================
  // LIKE / UNLIKE
  // ==========================================

  const handleLike = async (postId) => {
    if (likingPosts.current.has(postId)) return;

    const targetPost = posts.find((post) => post._id === postId);
    if (!targetPost) return;

    likingPosts.current.add(postId);

    const wasLiked = Boolean(targetPost.isLiked);
    const previousCount = targetPost.likesCount || 0;

    setPosts((previous) =>
      previous.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !wasLiked,
              likesCount: Math.max(0, previousCount + (wasLiked ? -1 : 1)),
            }
          : post,
      ),
    );

    if (targetPost.isDemo || String(postId).startsWith("demo-")) {
      likingPosts.current.delete(postId);
      return;
    }

    try {
      const response = wasLiked
        ? await axios.delete(`${API_URL}/api/like/${postId}`, {
            withCredentials: true,
          })
        : await axios.post(
            `${API_URL}/api/like/${postId}`,
            {},
            { withCredentials: true },
          );

      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount:
                  typeof response.data.likeCount === "number"
                    ? response.data.likeCount
                    : post.likesCount,
              }
            : post,
        ),
      );
    } catch (err) {
      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: wasLiked,
                likesCount: previousCount,
              }
            : post,
        ),
      );

      console.error("Unable to like photograph:", err);
      throw err;
    } finally {
      likingPosts.current.delete(postId);
    }
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (isDemoMode && activeCategory !== "All photographs") {
      const selectedTag = activeCategory.toLowerCase();

      result = result.filter((post) =>
        (post.tags || []).some((tag) => tag.toLowerCase() === selectedTag),
      );
    }

    if (isDemoMode && sort === "most-liked") {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else if (isDemoMode && sort === "most-discussed") {
      result.sort((a, b) => b.commentsCount - a.commentsCount);
    }

    const searchText = search.trim().toLowerCase();

    if (!searchText) return result;

    return result.filter((post) => {
      const searchableValues = [
        post.title,
        post.description,
        post.content,
        post.location,
        post.author?.name,
        post.authorProfile?.username,
        ...(post.tags || []),
      ];

      return searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText),
      );
    });
  }, [posts, search, activeCategory, isDemoMode, sort]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All photographs");
  };

  const handlePostCreated = () => {
    setShowUpload(false);
    setRefreshKey((previous) => previous + 1);
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-[#030A17] text-white">
        {/* NAVBAR */}
        <DrishyaNavbar
          onUpload={handleUploadClick}
          uploadingDisabled={authLoading || profileLoading}
        />

        {/* HERO IMAGE */}

        <section className="relative w-full overflow-hidden bg-[#030A17]">
          <img
            src={drishyaHero}
            alt="Drishya Manch"
            className="block h-auto max-h-[350px] min-h-[240px] w-full object-cover object-center"
          />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,rgba(3,10,23,0.98)_0%,rgba(3,10,23,0.78)_30%,rgba(3,10,23,0.35)_60%,transparent_100%)]" />

          <div className="absolute inset-0 flex items-center gap-4 px-5 sm:gap-7 sm:px-10 md:px-16 lg:px-20">
            {/* NEON CAMERA */}
            <Camera
              className="
        h-14 w-14 shrink-0
        text-[#00D4FF]
        drop-shadow-[0_0_10px_rgba(0,212,255,0.9)]
        sm:h-20 sm:w-20
        md:h-28 md:w-28
        lg:h-32 lg:w-32
      "
              strokeWidth={1.5}
            />

            {/* TITLE + TAGLINE */}
            <div className="flex flex-col">
              <p
                className="
          mt-3 font-[Orbitron] font-medium
          text-[10px] tracking-[0.2em]
          text-[#8DEFFF]
          sm:mt-4 sm:text-sm md:text-base
        "
              >
                Beauty of vision
              </p>

              <h1
                className="
          font-[Orbitron] font-bold uppercase
          leading-[0.95] tracking-[-0.04em]
          text-4xl text-white
          drop-shadow-[0_0_20px_rgba(0,212,255,0.2)]
          sm:text-5xl md:text-7xl lg:text-8xl
        "
              >
                Drishya
                <br />
                <span className="text-[#00D4FF] drop-shadow-[0_0_14px_rgba(0,212,255,0.65)]">
                  Manch.
                </span>
              </h1>

              <p
                className="
          mt-3 font-[Orbitron] font-medium
          text-[10px] tracking-[0.2em]
          text-[#8DEFFF]
          sm:mt-4 sm:text-sm md:text-base
        "
              >
                SHOW YOUR VISION.
              </p>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section
          id="photography-gallery"
          className="mx-auto max-w-[1800px] scroll-mt-20 px-4 pb-10 pt-5 sm:px-6 lg:px-9"
        >
          {/* CATEGORY + UPLOAD */}
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-full border px-5 py-2 text-[12px] font-medium transition-all duration-200 ${
                      active
                        ? "border-[#00D4FF] bg-[#00D4FF] text-[#03101C] shadow-[0_0_18px_rgba(0,212,255,0.18)]"
                        : "border-white/[0.09] bg-[#0A1225]/90 text-white/75 hover:border-[#00D4FF]/50 hover:text-[#00D4FF]"
                    }`}
                  >
                    {category === "All photographs" ? "All" : category}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={authLoading || profileLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#00D4FF] bg-transparent px-6 py-2.5 text-[12px] font-semibold text-white shadow-[0_0_16px_rgba(0,212,255,0.12)] transition hover:bg-[#00D4FF] hover:text-[#03101C] disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
            >
              <Images size={15} />
              Upload Photo
            </button>
          </div>

          {/* GALLERY HEADER + SEARCH */}
          <div className="mb-5 flex flex-col gap-4 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {/* SEARCH */}
              <div className="relative w-full sm:w-[260px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search photographs..."
                  className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#081326] pl-10 pr-9 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-[#00D4FF]/70"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* SORT */}
              <div className="relative flex h-10 shrink-0 items-center rounded-lg border border-white/[0.09] bg-[#081326] pl-3">
                <SlidersHorizontal size={14} className="mr-2 text-slate-500" />

                <select
                  id="drishya-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-full appearance-none bg-transparent pr-9 text-xs text-white outline-none"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#081326]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* DEMO NOTICE */}
          {isDemoMode && !loading && (
            <div className="mb-4 rounded-lg border border-[#163047] bg-[#071525] px-4 py-2.5 text-[11px] text-slate-400">
              You're viewing sample photographs. Real community posts will
              appear here when available.
            </div>
          )}

          {/* RESULTS COUNT */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              {loading
                ? "Finding photographs..."
                : `${filteredPosts.length} photographs`}
            </p>

            {(search || activeCategory !== "All photographs") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] text-[#00D4FF] transition hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && !loading && (
            <div className="mb-5 flex flex-col items-center gap-3 rounded-xl border border-[#173047] bg-[#071525] px-5 py-7 text-center">
              <p className="text-sm text-slate-400">{error}</p>

              <button
                type="button"
                onClick={() => setRefreshKey((previous) => previous + 1)}
                className="flex items-center gap-2 text-xs font-medium text-[#00D4FF]"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          )}

          {/* PHOTOGRAPHY GRID */}
          <DrishyaGrid
            posts={filteredPosts}
            loading={loading}
            onLike={handleLike}
          />

          {/* LOAD MORE */}
          {!loading && !isDemoMode && !error && hasMore && (
            <div className="flex flex-col items-center gap-3 pt-8">
              {loadMoreError && (
                <p className="text-xs text-red-400">{loadMoreError}</p>
              )}

              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-[#081326] px-6 py-2.5 text-xs font-medium text-slate-300 transition hover:border-[#00D4FF] hover:text-[#00D4FF] disabled:opacity-50"
              >
                {loadingMore && (
                  <LoaderCircle size={14} className="animate-spin" />
                )}

                {loadingMore ? "Loading..." : "Load more photographs"}
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredPosts.length === 0 && (
            <div className="py-16 text-center">
              <Camera size={30} className="mx-auto mb-3 text-slate-600" />

              <p className="text-xl font-medium text-white">
                No photographs found.
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Try another search or category.
              </p>
            </div>
          )}
        </section>

        {/* CREATE PROFILE */}
        {showCreateProfile && (
          <CreateProfile
            onClose={() => setShowCreateProfile(false)}
            onSuccess={handleProfileCreated}
          />
        )}

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80">
            <div className="min-h-screen">
              <DrishyaUpload
                onClose={() => setShowUpload(false)}
                onCreated={handlePostCreated}
              />
            </div>
          </div>
        )}
      </main>

      {/* INTRO LOADER */}
      {showIntroLoader && <DrishyaIntroLoader />}
    </>
  );
};

export default DrishyaManch;
