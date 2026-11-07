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
  Mic2,
  Music2,
  Guitar,
  AudioLines,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import SwarFeed from "../components/swar/SwarFeed";
import SwarUpload from "../components/swar/SwarUpload";
import SwarPostDetail from "../components/swar/SwarPostDetail";
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

// Extract like status from the existing like API response.
const getLikeStatus = (data) => {
  if (typeof data === "boolean") return data;

  const status =
    data?.isLiked ?? data?.liked ?? data?.data?.isLiked ?? data?.data?.liked;

  return typeof status === "boolean" ? status : null;
};

// Load the current user's like status for a post.
// Uses the same endpoint as SwarPostDetail.
const fetchPostLikeStatus = async (post) => {
  if (!post?._id || post.isDemo) return post;

  try {
    const response = await axios.get(`${API_URL}/api/like/${post._id}`, {
      withCredentials: true,
    });

    const isLiked = getLikeStatus(response.data);

    if (isLiked === null) {
      return post;
    }

    return {
      ...post,
      isLiked,
    };
  } catch (error) {
    console.warn(
      `Unable to fetch like status for post ${post._id}:`,
      error.response?.data?.message || error.message,
    );

    return post;
  }
};

// Hydrate posts with their actual like status.
const hydrateLikeStatuses = async (posts) => {
  return Promise.all(posts.map(fetchPostLikeStatus));
};

// Temporary public audio from Internet Archive.
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

const SwarManch = () => {
  const navigate = useNavigate();

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

  const [selectedPost, setSelectedPost] = useState(null);

  const likingPosts = useRef(new Set());

  // Upload action.
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

  // Load Prativa performances.
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
          // Get each post's actual like status before showing the feed.
          const postsWithLikeStatus = await hydrateLikeStatuses(fetchedPosts);

          if (cancelled) return;

          setPosts(postsWithLikeStatus);
          setHasMore(Boolean(response.data.pagination?.hasMore));
          return;
        }

        const archivePosts = await fetchArchivePerformances();

        if (cancelled) return;

        setPosts(archivePosts);
      } catch (err) {
        if (cancelled) return;

        console.error("SwarManch fetch error:", err);

        try {
          const archivePosts = await fetchArchivePerformances();

          if (cancelled) return;

          setPosts(archivePosts);

          if (archivePosts.length === 0) {
            setError("No audio performances are available right now.");
          }
        } catch (archiveError) {
          if (cancelled) return;

          console.error("Internet Archive fetch error:", archiveError);

          setPosts([]);
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

  // Load more posts.
  const handleLoadMore = async () => {
    if (loadingMore || loading || !hasMore || !API_URL) return;

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

  // Keep feed and detail modal synchronized.
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

  // Handle likes.
  // SwarFeed passes a complete post object, not just its ID.
  const handleLike = async (postOrId) => {
    const postId = typeof postOrId === "object" ? postOrId?._id : postOrId;

    if (!postId || likingPosts.current.has(postId)) return;

    const targetPost = posts.find((post) => post._id === postId);

    if (!targetPost) return;

    // Demo tracks use local-only likes.
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

    // Optimistic update.
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
      // Roll back if the API request fails.
      updatePostEverywhere(postId, {
        isLiked: wasLiked,
        likesCount: previousCount,
      });

      console.error("Unable to like performance:", err);
    } finally {
      likingPosts.current.delete(postId);
    }
  };

  // Filter and search posts.
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

  // Upload audio performance.
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
        {
          withCredentials: true,
        },
      );

      const newPost = response.data.post || response.data;

      if (newPost?._id && isAudioPost(newPost)) {
        setPosts((previous) => [
          {
            ...newPost,
            isLiked: false,
          },
          ...previous.filter((post) => post._id !== newPost._id),
        ]);
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

  // Open post detail modal.
  const handlePostSelect = (post) => {
    if (!post || post.isDemo || !post._id) return;

    setSelectedPost(post);
  };

  // Synchronize changes from the detail component.
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

  return (
    <main className="min-h-screen bg-[#F8F7F4]">
      <section className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-12">
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
                : "Upload performance"}
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
              placeholder="Search performances, creators or tags..."
              className="w-full rounded-xl border border-[#EAE6E0] bg-white py-3.5 pl-11 pr-4 text-sm text-[#191919] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E5092D]"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal size={17} className="shrink-0 text-[#99918B]" />

            <label
              htmlFor="swar-sort"
              className="shrink-0 text-sm text-[#77716F]"
            >
              Sort by
            </label>

            <div className="relative">
              <select
                id="swar-sort"
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
              const Icon = category.icon;
              const active = activeCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition ${
                    active
                      ? "border-[#E5092D] bg-[#E5092D] text-white"
                      : "border-[#EAE6E0] bg-white text-[#77716F] hover:border-[#E5092D] hover:text-[#E5092D]"
                  }`}
                >
                  <Icon size={15} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results and refresh */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-[#77716F]">
            {loading
              ? "Finding performances..."
              : `${filteredPosts.length} performances`}
          </p>

          <button
            type="button"
            onClick={() => setRefreshKey((previous) => previous + 1)}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-[#77716F] transition hover:text-[#E5092D] disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Feed */}
        <SwarFeed
          posts={filteredPosts}
          loading={loading}
          onPostSelect={handlePostSelect}
          onLike={handleLike}
          onComment={handlePostSelect}
        />

        {/* Load more */}
        {!loading && !error && hasMore && (
          <div className="flex flex-col items-center gap-3 pt-10">
            {loadMoreError && (
              <p className="text-sm text-[#E5092D]">{loadMoreError}</p>
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

              {loadingMore ? "Loading..." : "Load more performances"}
            </button>
          </div>
        )}

        {/* Error */}
        {!loading && error && filteredPosts.length === 0 && (
          <p className="py-12 text-center text-sm text-[#77716F]">{error}</p>
        )}

        {/* No search results */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl text-[#191919]">
              No performances found.
            </p>

            <p className="mt-2 text-sm text-[#99918B]">
              Try another search or category.
            </p>

            {(search || activeCategory !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-[#E5092D] hover:text-[#C90024]"
              >
                Clear filters
              </button>
            )}
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="my-auto w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <SwarUpload
              onUpload={handleAudioUpload}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <SwarPostDetail
          key={selectedPost._id}
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </main>
  );
};

export default SwarManch;
