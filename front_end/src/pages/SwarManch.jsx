import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useNavigationType } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  Upload,
  Mic2,
  Music2,
  Guitar,
  AudioLines,
  X,
} from "lucide-react";

import swarHero from "../assets/swarhero.png";

import { useAuth } from "../context/AuthContext";
import SwarFeed from "../components/swar/SwarFeed";
import SwarUpload from "../components/swar/SwarUpload";
import SwarPostDetail from "../components/swar/SwarPostDetail";
import SwarNavbar from "../components/swar/SwarNavbar";
import CreateProfile from "../components/CreateProfile";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const ARCHIVE_API = "https://archive.org/advancedsearch.php";
const ARCHIVE_METADATA_API = "https://archive.org/metadata";

const categories = [
  { label: "All performances", value: "all", icon: AudioLines },
  { label: "Vocals", value: "vocals", icon: Mic2 },
  { label: "Instrumentals", value: "instrumentals", icon: Guitar },
  { label: "Original music", value: "original-music", icon: Music2 },
  { label: "Spoken word", value: "spoken-word", icon: AudioLines },
];

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Most liked", value: "most-liked" },
  { label: "Most discussed", value: "most-discussed" },
];

const isAudioPost = (post) =>
  post?.category === "voice" &&
  post?.media?.type === "audio" &&
  Boolean(post?.media?.url);

const getPostCategory = (post) => {
  if (post?.subCategory) return post.subCategory;
  if (post?.audioCategory) return post.audioCategory;

  if (Array.isArray(post?.tags)) {
    const matchingCategory = post.tags.find((tag) =>
      categories.some((category) => category.value === tag),
    );

    if (matchingCategory) return matchingCategory;
  }

  return "all";
};

const getArchiveCategory = (text = "") => {
  const value = text.toLowerCase();

  if (
    /spoken.?word|poetry|poem|recitation|storytelling|monologue/.test(value)
  ) {
    return "spoken-word";
  }

  if (
    /instrumental|piano|guitar|violin|flute|symphony|orchestra|jazz/.test(value)
  ) {
    return "instrumentals";
  }

  if (
    /original|composition|songwriter|independent music|acoustic/.test(value)
  ) {
    return "original-music";
  }

  return "vocals";
};

const getLikeStatus = (data) => {
  if (typeof data === "boolean") return data;

  const status =
    data?.isLiked ?? data?.liked ?? data?.data?.isLiked ?? data?.data?.liked;

  return typeof status === "boolean" ? status : null;
};

const fetchPostLikeStatus = async (post) => {
  if (!post?._id || post.isDemo) return post;

  try {
    const response = await axios.get(`${API_URL}/api/like/${post._id}`, {
      withCredentials: true,
    });

    const isLiked = getLikeStatus(response.data);

    if (isLiked === null) return post;

    return { ...post, isLiked };
  } catch (error) {
    console.warn(
      `Unable to fetch like status for post ${post._id}:`,
      error.response?.data?.message || error.message,
    );

    return post;
  }
};

const hydrateLikeStatuses = async (posts) => {
  return Promise.all(posts.map(fetchPostLikeStatus));
};

// ==========================================
// INTERNET ARCHIVE FALLBACK
// ==========================================

const fetchArchivePerformances = async () => {
  const searchResponse = await axios.get(ARCHIVE_API, {
    params: {
      q: 'mediatype:audio AND format:"MP3"',
      "fl[]": ["identifier", "title", "creator", "date", "description"],
      rows: 12,
      page: 1,
      output: "json",
    },
    timeout: 15000,
  });

  const records = searchResponse.data?.response?.docs || [];

  const performances = await Promise.all(
    records.slice(0, 12).map(async (record) => {
      try {
        if (!record.identifier) return null;

        const metadataResponse = await axios.get(
          `${ARCHIVE_METADATA_API}/${encodeURIComponent(record.identifier)}`,
          { timeout: 15000 },
        );

        const metadata = metadataResponse.data;
        const files = metadata?.files || [];

        const audioFile = files.find((file) => {
          const filename = file.name?.toLowerCase() || "";

          return (
            filename.endsWith(".mp3") &&
            !filename.includes("_meta") &&
            !filename.includes("_files")
          );
        });

        if (!audioFile) return null;

        const title =
          record.title ||
          metadata.metadata?.title ||
          "Untitled audio performance";

        const creator =
          record.creator ||
          metadata.metadata?.creator ||
          "Internet Archive contributor";

        const description =
          typeof record.description === "string"
            ? record.description
            : Array.isArray(record.description)
              ? record.description.join(" ")
              : "A public audio recording shared through Internet Archive.";

        const category = getArchiveCategory(
          `${title} ${description} ${audioFile.name}`,
        );

        return {
          _id: `archive-${record.identifier}`,
          isDemo: true,
          title,
          description: description.slice(0, 500),
          category: "voice",
          categoryLabel: categories.find((item) => item.value === category)
            ?.label,
          subCategory: category,
          media: {
            type: "audio",
            url: `https://archive.org/download/${encodeURIComponent(
              record.identifier,
            )}/${encodeURIComponent(audioFile.name)}`,
          },
          author: {
            _id: null,
            name: creator,
          },
          authorProfile: {
            user: null,
            username: "",
            profileImage: "",
          },
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          isSaved: false,
          tags: [category, "internet-archive"],
          createdAt: record.date || metadata.metadata?.date || null,
        };
      } catch (error) {
        console.warn(
          `Unable to load Internet Archive item ${record.identifier}:`,
          error.message,
        );

        return null;
      }
    }),
  );

  return performances.filter(Boolean);
};

// ==========================================
// SWAR INTRO LOADER
// ==========================================

const SwarIntroLoader = () => (
  <div className="swar-loader fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-hidden bg-[#05051A]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.08] blur-[120px]" />

      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(139,92,246,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
    </div>

    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      <div className="relative mb-9 flex h-32 w-32 items-center justify-center">
        <div className="swar-outer-ring absolute inset-0 rounded-full border border-dashed border-[#8B5CF6]/30" />

        <div className="swar-middle-ring absolute inset-3 rounded-full border border-[#8B5CF6]/20" />

        <div className="absolute inset-7 rounded-full border border-[#8B5CF6]/40 bg-[#100C2A] shadow-[0_0_45px_rgba(139,92,246,0.15)]" />

        <AudioLines
          size={55}
          strokeWidth={1.2}
          className="swar-aperture relative z-10 text-[#A78BFA]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-[#A78BFA]">
          <Music2 size={16} />

          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">
            PRATIVA
          </span>
        </div>

        <h1 className="font-[Orbitron] text-3xl font-semibold tracking-[0.1em] text-white sm:text-4xl">
          SWAR <span className="text-[#A78BFA]">MANCH</span>
        </h1>

        <p className="text-sm text-[#A5A0BC]">Every melody has a story.</p>
      </div>

      <div className="mt-10 w-44">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#77718F]">
            Tuning into melodies
          </span>

          <AudioLines size={14} className="text-[#A78BFA]" />
        </div>

        <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
          <div className="swar-progress h-full rounded-full bg-[#A78BFA]" />
        </div>
      </div>
    </div>

    <style>{`
      .swar-loader {
        animation: swarFadeIn 0.4s ease-out both;
      }

      .swar-outer-ring {
        animation: swarRotate 12s linear infinite;
      }

      .swar-middle-ring {
        animation: swarRotateReverse 8s linear infinite;
      }

      .swar-aperture {
        animation: swarPulse 2s ease-in-out infinite;
      }

      .swar-progress {
        width: 35%;
        animation: swarProgress 1.7s ease-in-out infinite;
      }

      @keyframes swarRotate {
        to { transform: rotate(360deg); }
      }

      @keyframes swarRotateReverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }

      @keyframes swarPulse {
        0%, 100% { transform: scale(0.94); opacity: 0.75; }
        50% { transform: scale(1.06); opacity: 1; }
      }

      @keyframes swarProgress {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(390%); }
      }

      @keyframes swarFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .swar-outer-ring,
        .swar-middle-ring,
        .swar-aperture,
        .swar-progress {
          animation: none;
        }
      }
    `}</style>
  </div>
);

// ==========================================
// SWAR MANCH PAGE
// ==========================================

const SwarManch = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const {
    isAuthenticated,
    hasProfile,
    loading: authLoading,
    profileLoading,
    refreshProfile,
  } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showIntroLoader, setShowIntroLoader] = useState(
    navigationType === "PUSH",
  );

  const [introMinimumElapsed, setIntroMinimumElapsed] = useState(false);

  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("latest");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);

  const likingPosts = useRef(new Set());

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
        err.response?.data?.message || err.message,
      );
    }
  };

  // ==========================================
  // FETCH PERFORMANCES
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchPerformances = async () => {
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
          category: "voice",
          sort,
          page: 1,
          limit: 30,
        };

        if (activeCategory !== "all") {
          params.tag = activeCategory;
        }

        const response = await axios.get(`${API_URL}/api/post/feed`, {
          params,
          withCredentials: true,
        });

        if (cancelled) return;

        const fetchedPosts = (response.data.posts || []).filter(isAudioPost);

        if (fetchedPosts.length > 0) {
          const postsWithLikeStatus = await hydrateLikeStatuses(fetchedPosts);

          if (cancelled) return;

          setPosts(postsWithLikeStatus);
          setIsArchiveMode(false);
          setHasMore(Boolean(response.data.pagination?.hasMore));

          return;
        }

        const archivePosts = await fetchArchivePerformances();

        if (cancelled) return;

        setPosts(archivePosts);
        setIsArchiveMode(true);

        if (archivePosts.length === 0) {
          setError("No audio performances are available right now.");
        }
      } catch (err) {
        if (cancelled) return;

        console.warn("Using Swar Archive content:", err.message);

        try {
          const archivePosts = await fetchArchivePerformances();

          if (cancelled) return;

          setPosts(archivePosts);
          setIsArchiveMode(true);

          if (archivePosts.length === 0) {
            setError("No audio performances are available right now.");
          }
        } catch (archiveError) {
          if (cancelled) return;

          console.error("Internet Archive fetch error:", archiveError);

          setPosts([]);
          setIsArchiveMode(false);
          setError("Unable to load performances. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPerformances();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, sort, refreshKey]);

  // ==========================================
  // LOAD MORE
  // ==========================================

  const handleLoadMore = async () => {
    if (loadingMore || loading || !hasMore || !API_URL || isArchiveMode) {
      return;
    }

    const nextPage = page + 1;

    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const params = {
        category: "voice",
        sort,
        page: nextPage,
        limit: 30,
      };

      if (activeCategory !== "all") {
        params.tag = activeCategory;
      }

      const response = await axios.get(`${API_URL}/api/post/feed`, {
        params,
        withCredentials: true,
      });

      const fetchedPosts = (response.data.posts || []).filter(isAudioPost);

      const newPosts = await hydrateLikeStatuses(fetchedPosts);

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
      console.error("Unable to load more performances:", err);

      setLoadMoreError(
        err.response?.data?.message ||
          "Unable to load more performances. Please try again.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // ==========================================
  // UPDATE POST
  // ==========================================

  const updatePostEverywhere = (postId, updates) => {
    setPosts((previous) =>
      previous.map((post) =>
        post._id === postId ? { ...post, ...updates } : post,
      ),
    );

    setSelectedPost((previous) =>
      previous?._id === postId ? { ...previous, ...updates } : previous,
    );
  };

  // ==========================================
  // LIKE / UNLIKE
  // ==========================================

  const handleLike = async (postOrId) => {
    const postId = typeof postOrId === "object" ? postOrId?._id : postOrId;

    if (!postId || likingPosts.current.has(postId)) return;

    const targetPost = posts.find((post) => post._id === postId);

    if (!targetPost) return;

    if (targetPost.isDemo) {
      updatePostEverywhere(postId, {
        isLiked: !targetPost.isLiked,
        likesCount: Math.max(
          0,
          (targetPost.likesCount || 0) + (targetPost.isLiked ? -1 : 1),
        ),
      });

      return;
    }

    likingPosts.current.add(postId);

    const wasLiked = Boolean(targetPost.isLiked);
    const previousCount = targetPost.likesCount || 0;

    updatePostEverywhere(postId, {
      isLiked: !wasLiked,
      likesCount: Math.max(0, previousCount + (wasLiked ? -1 : 1)),
    });

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

      const updates = {};

      if (typeof response.data.likeCount === "number") {
        updates.likesCount = response.data.likeCount;
      }

      if (typeof response.data.isLiked === "boolean") {
        updates.isLiked = response.data.isLiked;
      }

      if (typeof response.data.liked === "boolean") {
        updates.isLiked = response.data.liked;
      }

      if (Object.keys(updates).length > 0) {
        updatePostEverywhere(postId, updates);
      }
    } catch (err) {
      updatePostEverywhere(postId, {
        isLiked: wasLiked,
        likesCount: previousCount,
      });

      console.error("Unable to like performance:", err);
    } finally {
      likingPosts.current.delete(postId);
    }
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory !== "all") {
      result = result.filter(
        (post) => getPostCategory(post) === activeCategory,
      );
    }

    const searchText = search.trim().toLowerCase();

    if (searchText) {
      result = result.filter((post) => {
        const searchableValues = [
          post.title,
          post.description,
          post.content,
          post.caption,
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
    }

    return result;
  }, [posts, search, activeCategory]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("all");
  };

  // ==========================================
  // AUDIO UPLOAD
  // ==========================================

  const handleAudioUpload = async ({ file, title, description, category }) => {
    try {
      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const formData = new FormData();

      formData.append("media", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", "voice");
      formData.append("tags", JSON.stringify([category]));

      const response = await axios.post(
        `${API_URL}/api/post/create`,
        formData,
        { withCredentials: true },
      );

      const newPost = response.data.post || response.data;

      if (newPost?._id && isAudioPost(newPost)) {
        setPosts((previous) => [
          { ...newPost, isLiked: false },
          ...previous.filter((post) => post._id !== newPost._id),
        ]);

        setIsArchiveMode(false);
      } else {
        setRefreshKey((previous) => previous + 1);
      }

      setShowUpload(false);
    } catch (err) {
      console.error("SwarManch upload error:", err);

      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Unable to upload your performance. Please try again.",
      );
    }
  };

  // ==========================================
  // POST DETAILS
  // ==========================================

  const handlePostSelect = (post) => {
    if (!post || post.isDemo || !post._id) return;

    setSelectedPost(post);
  };

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
  // PAGE
  // ==========================================

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-[#05051A] text-white">
        {/* NAVBAR */}
        <SwarNavbar
          onUpload={handleUploadClick}
          uploadingDisabled={authLoading || profileLoading}
        />

        {/* HERO IMAGE */}
        <section className="relative w-full overflow-hidden bg-[#05051A]">
          <img
            src={swarHero}
            alt="Swar Manch"
            className="block h-auto max-h-[350px] min-h-[240px] w-full object-cover object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,26,0.98)_0%,rgba(5,5,26,0.78)_30%,rgba(5,5,26,0.35)_60%,transparent_100%)]" />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05051A] via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center gap-4 px-5 sm:gap-7 sm:px-10 md:px-16 lg:px-20">
            {/* NEON AUDIO ICON */}
            <AudioLines
              className="
                h-14 w-14 shrink-0
                text-[#A78BFA]
                drop-shadow-[0_0_12px_rgba(139,92,246,0.9)]
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
                  text-[#C4B5FD]
                  sm:mt-4 sm:text-sm md:text-base
                "
              >
                The sound of expression
              </p>

              <h1
                className="
                  font-[Orbitron] font-bold uppercase
                  leading-[0.95] tracking-[-0.04em]
                  text-4xl text-white
                  drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]
                  sm:text-5xl md:text-7xl lg:text-8xl
                "
              >
                Swar
                <br />
                <span className="text-[#A78BFA] drop-shadow-[0_0_14px_rgba(139,92,246,0.65)]">
                  Manch.
                </span>
              </h1>

              <p
                className="
                  mt-3 font-[Orbitron] font-medium
                  text-[10px] tracking-[0.2em]
                  text-[#C4B5FD]
                  sm:mt-4 sm:text-sm md:text-base
                "
              >
                YOU ARE MELODIOUS.
              </p>
            </div>
          </div>
        </section>

        {/* PERFORMANCES */}
        <section
          id="swar-performances"
          className="mx-auto max-w-[1800px] scroll-mt-20 px-4 pb-10 pt-5 sm:px-6 lg:px-9"
        >
          {/* CATEGORY + UPLOAD */}
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon;
                const active = activeCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-5 py-2 text-[12px] font-medium transition-all duration-200 ${
                      active
                        ? "border-[#8B5CF6] bg-[#8B5CF6] text-white shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                        : "border-white/[0.09] bg-[#0B0B27]/90 text-white/75 hover:border-[#8B5CF6]/50 hover:text-[#A78BFA]"
                    }`}
                  >
                    <Icon size={14} />

                    {category.label === "All performances"
                      ? "All"
                      : category.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={authLoading || profileLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#8B5CF6] bg-transparent px-6 py-2.5 text-[12px] font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.12)] transition hover:bg-[#8B5CF6] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
            >
              {authLoading || profileLoading ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              Upload Performance
            </button>
          </div>

          {/* SEARCH + SORT */}
          <div className="mb-5 flex flex-col gap-4 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {/* SEARCH */}
              <div className="relative w-full sm:w-[260px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A78BFA]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search performances..."
                  className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#0B0B27] pl-10 pr-9 text-xs text-white outline-none transition placeholder:text-[#77718F] focus:border-[#8B5CF6]/70"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77718F] hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* SORT */}
              <div className="relative flex h-10 shrink-0 items-center rounded-lg border border-white/[0.09] bg-[#0B0B27] pl-3">
                <SlidersHorizontal size={14} className="mr-2 text-[#A78BFA]" />

                <select
                  id="swar-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-full appearance-none bg-transparent pr-9 text-xs text-white outline-none"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0B0B27]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 text-[#A78BFA]"
                />
              </div>
            </div>
          </div>

          {/* ARCHIVE NOTICE */}
          {isArchiveMode && !loading && (
            <div className="mb-4 rounded-lg border border-[#30234E] bg-[#100C27] px-4 py-2.5 text-[11px] text-[#A5A0BC]">
              You're exploring public audio performances from Internet Archive.
              Community performances will appear here when available.
            </div>
          )}

          {/* RESULTS COUNT */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] text-[#85809F]">
              {loading
                ? "Discovering performances..."
                : `${filteredPosts.length} performances`}
            </p>

            {(search || activeCategory !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] text-[#A78BFA] transition hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && !loading && (
            <div className="mb-5 flex flex-col items-center gap-3 rounded-xl border border-[#30234E] bg-[#100C27] px-5 py-7 text-center">
              <p className="text-sm text-[#A5A0BC]">{error}</p>

              <button
                type="button"
                onClick={() => setRefreshKey((previous) => previous + 1)}
                className="flex items-center gap-2 text-xs font-medium text-[#A78BFA]"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          )}

          {/* PERFORMANCE FEED */}
          <div className="min-h-[300px]">
            <SwarFeed
              posts={filteredPosts}
              loading={loading}
              onPostSelect={handlePostSelect}
              onLike={handleLike}
              onComment={handlePostSelect}
            />

            {/* EMPTY STATE */}
            {!loading && !error && filteredPosts.length === 0 && (
              <div className="py-16 text-center">
                <Music2 size={30} className="mx-auto mb-3 text-[#77718F]" />

                <p className="text-xl font-medium text-white">
                  No performances found.
                </p>

                <p className="mt-2 text-xs text-[#85809F]">
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={
                    search || activeCategory !== "all"
                      ? clearFilters
                      : handleUploadClick
                  }
                  className="mt-4 rounded-lg border border-[#8B5CF6]/40 px-4 py-2 text-xs font-semibold text-[#C4B5FD] transition hover:bg-[#8B5CF6] hover:text-white"
                >
                  {search || activeCategory !== "all"
                    ? "Clear filters"
                    : "Upload performance"}
                </button>
              </div>
            )}
          </div>

          {/* LOAD MORE */}
          {!loading && !isArchiveMode && !error && hasMore && (
            <div className="flex flex-col items-center gap-3 pt-8">
              {loadMoreError && (
                <p className="text-xs text-red-400">{loadMoreError}</p>
              )}

              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0B0B27] px-6 py-2.5 text-xs font-medium text-[#C4B5FD] transition hover:border-[#8B5CF6] hover:text-[#A78BFA] disabled:opacity-50"
              >
                {loadingMore && (
                  <LoaderCircle size={14} className="animate-spin" />
                )}

                {loadingMore ? "Loading..." : "Load more performances"}
              </button>
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
          <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/80"
            onClick={() => setShowUpload(false)}
          >
            <div
              className="min-h-screen"
              onClick={(event) => event.stopPropagation()}
            >
              <SwarUpload
                onUpload={handleAudioUpload}
                onCancel={() => setShowUpload(false)}
              />
            </div>
          </div>
        )}

        {/* POST DETAIL */}
        {selectedPost && (
          <SwarPostDetail
            key={selectedPost._id}
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onPostUpdated={handlePostUpdated}
          />
        )}
      </main>

      {/* INTRO LOADER */}
      {showIntroLoader && <SwarIntroLoader />}
    </>
  );
};

export default SwarManch;
