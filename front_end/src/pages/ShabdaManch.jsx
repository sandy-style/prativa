import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Feather,
  Search,
  SlidersHorizontal,
  PenLine,
  RefreshCw,
  LoaderCircle,
  Sparkles,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import ShabdaFeed from "../components/shabda/ShabdaFeed";
import ShabdaUpload from "../components/shabda/ShabdaUpload";
import ShabdaPostDetails from "../components/shabda/ShabdaPostDetail";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const PAGE_LIMIT = 30;

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "most-liked", label: "Most loved" },
  { value: "most-discussed", label: "Most discussed" },
];

const ShabdaManch = () => {
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [showUpload, setShowUpload] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [showSort, setShowSort] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const currentUserId =
    user?._id ||
    user?.id ||
    user?.userId ||
    user?.user?._id ||
    user?.user?.id ||
    null;

  // Fetch written posts.
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
          append ? [...previous, ...formattedPosts] : formattedPosts,
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
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort],
  );

  // Initial feed and sorting changes.
  useEffect(() => {
    fetchPosts({ pageNumber: 1 });
  }, [fetchPosts]);

  // Load more posts.
  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;

    fetchPosts({
      pageNumber: page + 1,
      append: true,
    });
  };

  // Open upload editor.
  const handleOpenUpload = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setShowUpload(true);
  };

  // Add newly published post to the feed.
  const handlePostCreated = (newPost) => {
    if (!newPost?._id) return;

    const formattedPost = {
      ...newPost,
      likesCount: 0,
      commentsCount: 0,
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

  // Update a post without replacing the entire feed.
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

  // Select a post for the detail modal.
  const handlePostSelect = (post) => {
    if (!post?._id) return;
    setSelectedPost(post);
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
  };

  // Search locally through loaded posts.
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return posts;

    return posts.filter((post) => {
      const searchableText = [
        post.title,
        post.description,
        post.content,
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

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label || "Latest";

  return (
    <main className="min-h-screen bg-[#F8F7F4] pb-20 text-[#191919]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#EAE6E0]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#E5092D]/[0.045] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-36 left-[-80px] h-80 w-80 rounded-full bg-[#E9E5DF]/70 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EAE6E0] bg-white/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
                <Feather size={13} />
                The written world of Prativa
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#191919] sm:text-6xl lg:text-7xl">
                Some things
                <br />
                are meant to be
                <br />
                <span className="font-serif font-normal italic text-[#E5092D]">
                  written.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[#77716F] sm:text-base sm:leading-8">
                A home for poetry, stories, reflections, and the thoughts that
                deserve more than a passing moment. Read something beautiful.
                Leave something of your own.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenUpload}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E5092D] px-6 py-3.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#C90024] hover:shadow-md"
                >
                  <PenLine size={15} />
                  Write something
                </button>

                <a
                  href="#shabda-feed"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6E0] bg-white px-6 py-3.5 text-xs font-semibold text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D]"
                >
                  <BookOpen size={15} />
                  Explore writings
                </a>
              </div>
            </div>

            {/* Editorial writing panel */}
            <div className="relative mx-auto hidden w-full max-w-[280px] lg:block">
              <div className="absolute -inset-4 rotate-[-5deg] rounded-[2rem] bg-[#F0DDE0]" />

              <div className="relative rotate-[2deg] rounded-[1.5rem] border border-[#EAE6E0] bg-[#FFFEFC] p-7 shadow-xl">
                <div className="mb-12 flex items-center justify-between">
                  <Feather size={22} className="text-[#E5092D]" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#AAA39D]">
                    A page of thoughts
                  </span>
                </div>

                <div className="font-serif text-3xl leading-[1.35] text-[#292522]">
                  "Words are
                  <br />
                  little windows
                  <br />
                  into the soul."
                </div>

                <div className="my-7 h-px w-full bg-[#EAE6E0]" />

                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#99918B]">
                    ShabdaManch
                  </span>

                  <Sparkles size={15} className="text-[#E5092D]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feed section */}
      <section
        id="shabda-feed"
        className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12"
      >
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#99918B]">
                <BookOpen size={13} />
                Discover and read
              </div>

              <h2 className="font-serif text-3xl text-[#191919] sm:text-4xl">
                The written collection
              </h2>

              <p className="mt-2 text-xs text-[#77716F]">
                {totalPosts > 0
                  ? `${totalPosts.toLocaleString()} published writings`
                  : "Discover thoughts, stories, and poetry from the community."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchPosts({ pageNumber: 1 })}
              disabled={loading}
              aria-label="Refresh feed"
              className="inline-flex h-10 w-10 items-center justify-center self-start rounded-xl border border-[#EAE6E0] bg-white text-[#77716F] transition hover:border-[#E5092D] hover:text-[#E5092D] disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search and sort */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99918B]"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search writings, authors, or tags..."
                className="h-12 w-full rounded-xl border border-[#EAE6E0] bg-white pl-11 pr-11 text-xs text-[#191919] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E5092D]"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99918B] transition hover:text-[#E5092D]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSort((previous) => !previous)}
                className="flex h-12 w-full items-center justify-between gap-5 rounded-xl border border-[#EAE6E0] bg-white px-4 text-xs font-medium text-[#514C48] transition hover:border-[#E5092D] sm:w-48"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={15} />
                  {activeSortLabel}
                </span>

                <ChevronDown
                  size={15}
                  className={`transition-transform ${
                    showSort ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSort && (
                <>
                  <button
                    type="button"
                    aria-label="Close sort menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setShowSort(false)}
                  />

                  <div className="absolute right-0 top-14 z-20 w-full overflow-hidden rounded-xl border border-[#EAE6E0] bg-white p-1 shadow-xl sm:w-48">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSort(option.value);
                          setShowSort(false);
                        }}
                        className={`w-full rounded-lg px-4 py-3 text-left text-xs transition ${
                          sort === option.value
                            ? "bg-[#FCEAED] font-semibold text-[#E5092D]"
                            : "text-[#514C48] hover:bg-[#F8F7F4] hover:text-[#E5092D]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-7 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

              <div>
                <p className="text-xs font-semibold text-red-700">
                  Couldn't load ShabdaManch
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchPosts({ pageNumber: 1 })}
              className="shrink-0 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* Feed */}
        <ShabdaFeed
          posts={filteredPosts}
          loading={loading}
          onPostSelect={handlePostSelect}
          onLike={handlePostSelect}
          onComment={handlePostSelect}
          onSave={handlePostSelect}
        />

        {/* No search results */}
        {!loading && posts.length > 0 && filteredPosts.length === 0 && (
          <div className="py-16 text-center">
            <Search size={28} className="mx-auto mb-4 text-[#99918B]" />

            <h3 className="font-serif text-xl text-[#191919]">
              No writings found
            </h3>

            <p className="mt-2 text-xs text-[#77716F]">
              Try a different search term.
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs font-semibold text-[#E5092D] transition hover:text-[#C90024]"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Empty feed */}
        {!loading && !error && posts.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen size={30} className="mx-auto mb-4 text-[#AAA39D]" />

            <h3 className="font-serif text-2xl text-[#191919]">
              The first page is waiting.
            </h3>

            <p className="mt-2 text-sm text-[#77716F]">
              Be the first to share a poem, story, or thought.
            </p>

            <button
              type="button"
              onClick={handleOpenUpload}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E5092D] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#C90024]"
            >
              <PenLine size={15} />
              Write the first post
            </button>
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && filteredPosts.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6E0] bg-white px-7 py-3.5 text-xs font-semibold text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more writings"
              )}
            </button>
          </div>
        )}
      </section>

      {/* Floating write button */}
      <button
        type="button"
        onClick={handleOpenUpload}
        aria-label="Write something"
        className="fixed bottom-6 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#E5092D] px-5 text-xs font-semibold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#C90024] sm:bottom-8 sm:right-8"
      >
        <PenLine size={17} />
        <span>Write</span>
      </button>

      {/* Upload modal */}
      {showUpload && (
        <ShabdaUpload
          onClose={() => setShowUpload(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Post details modal */}
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
  );
};

export default ShabdaManch;
