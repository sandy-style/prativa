import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  Upload,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import DrishyaGrid from "../components/drishya/DrishyaGrid";
import DrishyaUpload from "../components/drishya/DrishyaUpload";
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

const DrishyaManch = () => {
  const navigate = useNavigate();

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

  // Check authentication and profile before opening upload.
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

  // Called after successful profile creation.
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

  // Fetch gallery.
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGallery();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, sort, refreshKey]);

  // Load more real photographs.
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

  // Like or unlike a photograph.
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

  // Search and filter photographs.
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

  return (
    <main className="min-h-screen bg-[#F8F7F4]">
      {/* Gallery */}
      <section className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Demo notice */}
        {isDemoMode && !loading && (
          <div className="mb-6 rounded-xl border border-[#EAE6E0] bg-white px-4 py-3 text-xs text-[#77716F]">
            You're viewing sample photographs. Real community posts will appear
            here when available.
          </div>
        )}

        {/* Upload action */}
        <div className="mb-7 flex justify-end">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={authLoading || profileLoading}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#E5092D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C90024] disabled:cursor-wait disabled:opacity-60"
          >
            {authLoading || profileLoading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Upload size={17} />
            )}

            <span>
              {authLoading || profileLoading
                ? "Checking..."
                : "Upload photograph"}
            </span>
          </button>
        </div>

        {/* Search and sorting */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99918B]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search photographs, creators or tags..."
              className="w-full rounded-xl border border-[#EAE6E0] bg-white py-3.5 pl-11 pr-4 text-sm text-[#191919] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E5092D]"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal size={17} className="shrink-0 text-[#99918B]" />

            <label
              htmlFor="drishya-sort"
              className="shrink-0 text-sm text-[#77716F]"
            >
              Sort by
            </label>

            <div className="relative">
              <select
                id="drishya-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="appearance-none rounded-xl border border-[#EAE6E0] bg-white py-3 pl-4 pr-10 text-sm text-[#191919] outline-none transition focus:border-[#E5092D]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77716F]"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#99918B]">
            Browse by category
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-sm transition ${
                    active
                      ? "border-[#E5092D] bg-[#E5092D] text-white"
                      : "border-[#EAE6E0] bg-white text-[#77716F] hover:border-[#E5092D] hover:text-[#E5092D]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-[#77716F]">
            {loading
              ? "Finding photographs..."
              : `${filteredPosts.length} photographs`}
          </p>

          {(search || activeCategory !== "All photographs") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#E5092D] transition hover:text-[#C90024]"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="mb-6 flex flex-col items-center gap-3 rounded-xl border border-[#EAE6E0] bg-white px-5 py-8 text-center">
            <p className="text-sm text-[#77716F]">{error}</p>

            <button
              type="button"
              onClick={() => setRefreshKey((previous) => previous + 1)}
              className="flex items-center gap-2 text-sm font-medium text-[#E5092D]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Gallery grid */}
        <DrishyaGrid
          posts={filteredPosts}
          loading={loading}
          onLike={handleLike}
        />

        {/* Load more */}
        {!loading && !isDemoMode && !error && hasMore && (
          <div className="flex flex-col items-center gap-3 pt-10">
            {loadMoreError && (
              <p className="text-sm text-red-600">{loadMoreError}</p>
            )}

            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 rounded-full border border-[#EAE6E0] bg-white px-7 py-3 text-sm font-medium text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D] disabled:opacity-50"
            >
              {loadingMore && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {loadingMore ? "Loading..." : "Load more photographs"}
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && filteredPosts.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl text-[#191919]">
              No photographs found.
            </p>

            <p className="mt-2 text-sm text-[#99918B]">
              Try another search or category.
            </p>
          </div>
        )}
      </section>

      {/* Create Profile Modal */}
      {showCreateProfile && (
        <CreateProfile
          onClose={() => setShowCreateProfile(false)}
          onSuccess={handleProfileCreated}
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60">
          <div className="min-h-screen">
            <DrishyaUpload
              onClose={() => setShowUpload(false)}
              onCreated={handlePostCreated}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default DrishyaManch;
