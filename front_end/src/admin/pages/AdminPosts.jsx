import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Trash2,
  LoaderCircle,
  FileText,
  Eye,
  X,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserRound,
  Filter,
  Image as ImageIcon,
  Music2,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const categories = ["all", "voice", "vision", "art", "words"];

const categoryStyles = {
  voice: "bg-violet-50 text-violet-700 border-violet-100",
  vision: "bg-blue-50 text-blue-700 border-blue-100",
  art: "bg-amber-50 text-amber-700 border-amber-100",
  words: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page, limit: 20 };

      if (search.trim()) params.search = search.trim();
      if (category !== "all") params.category = category;

      const res = await axios.get(`${API_URL}/api/admin/posts`, {
        params,
        withCredentials: true,
      });

      if (res.data.success) {
        setPosts(res.data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Fetch posts err:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load posts. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this post?")
    ) {
      return;
    }

    try {
      setDeletingId(postId);

      const res = await axios.delete(`${API_URL}/api/post/${postId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));

        if (selectedPost?._id === postId) {
          setSelectedPost(null);
        }
      }
    } catch (err) {
      console.error("Delete post err:", err);
      alert(err.response?.data?.message || "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryStyle = (cat) => {
    return (
      categoryStyles[cat?.toLowerCase()] ||
      "bg-gray-100 text-gray-600 border-gray-200"
    );
  };

  const currentCategoryLabel =
    category === "all"
      ? "All categories"
      : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="space-y-7 text-[#242124]">
      {/* Page Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
            Content management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            Post Moderation
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#77716F]">
            Review published creations, monitor engagement, and manage content
            across Voice, Vision, Art, and Words.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-[#EBE8E5] bg-white px-4 py-3 shadow-sm lg:self-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F9EAED] text-[#991B35]">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#99918D]">
              Current view
            </p>
            <p className="text-sm font-semibold text-[#242124]">
              {currentCategoryLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center gap-3 rounded-xl border border-[#E9E5E2] bg-[#FAF9F7] px-4 py-3 transition focus-within:border-[#991B35] focus-within:ring-2 focus-within:ring-[#991B35]/10 lg:max-w-md"
          >
            <Search size={17} className="shrink-0 text-[#9A918D]" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full bg-transparent text-sm text-[#242124] outline-none placeholder:text-[#AAA29E]"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  setTimeout(() => fetchPosts(), 0);
                }}
                className="text-[#99918D] transition hover:text-[#991B35]"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-[#817975]">
              <Filter size={14} />
              Category
            </span>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold capitalize transition ${
                  category === cat
                    ? "bg-[#991B35] text-white shadow-sm"
                    : "border border-[#EBE8E5] bg-white text-[#77716F] hover:border-[#991B35]/30 hover:text-[#991B35]"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={17} />
            {error}
          </div>

          <button
            type="button"
            onClick={fetchPosts}
            className="text-xs font-semibold text-red-700 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Posts Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#F0EDEA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-bold text-[#242124]">
              Published creations
            </h2>
            <p className="mt-1 text-xs text-[#96908C]">
              Manage and review community content
            </p>
          </div>

          <span className="w-fit rounded-lg bg-[#FAF9F7] px-3 py-1.5 text-xs font-medium text-[#77716F]">
            {posts.length} posts displayed
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoaderCircle size={30} className="animate-spin text-[#991B35]" />
            <p className="mt-3 text-sm text-[#96908C]">
              Loading published posts...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9EAED] text-[#991B35]">
              <FileText size={25} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#242124]">
              No posts found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#96908C]">
              No published creations match your current search or category
              filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setPage(1);
              }}
              className="mt-4 rounded-lg bg-[#991B35] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7E172C]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-[#F0EDEA] bg-[#FAF9F7]">
                  <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#918984]">
                    <th className="px-6 py-4">Post title</th>
                    <th className="px-4 py-4">Manch</th>
                    <th className="px-4 py-4">Author</th>
                    <th className="px-4 py-4">Engagement</th>
                    <th className="px-4 py-4">Published</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F2EFEC]">
                  {posts.map((p) => (
                    <tr key={p._id} className="transition hover:bg-[#FCFBFA]">
                      <td className="max-w-[260px] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
                            {p.media?.type === "audio" ? (
                              <Music2 size={17} />
                            ) : p.media?.type === "image" ? (
                              <ImageIcon size={17} />
                            ) : (
                              <FileText size={17} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#302B29]">
                              {p.title || "Untitled Creation"}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#A19A96]">
                              {p.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold capitalize ${getCategoryStyle(
                            p.category,
                          )}`}
                        >
                          {p.category || "Unknown"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2EFEC] text-[#77716F]">
                            <UserRound size={13} />
                          </div>
                          <span className="max-w-[130px] truncate text-xs font-medium text-[#5F5854]">
                            {p.author?.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#991B35]">
                            <Heart size={13} />
                            {p.likesCount || 0}
                          </span>

                          <span className="flex items-center gap-1.5 text-xs font-medium text-[#77716F]">
                            <MessageCircle size={13} />
                            {p.commentsCount || 0}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-[#77716F]">
                          <CalendarDays size={13} className="text-[#A49C97]" />
                          {formatDate(p.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPost(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EBE8E5] bg-white text-[#77716F] transition hover:border-[#991B35]/30 hover:bg-[#F9EAED] hover:text-[#991B35]"
                            title="Preview post"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(p._id)}
                            disabled={deletingId === p._id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F0E2E3] bg-white text-[#B34A55] transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete post"
                          >
                            {deletingId === p._id ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-[#F0EDEA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-[#918984]">
                Showing {posts.length} posts on page {page}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 rounded-lg border border-[#EBE8E5] px-3 py-2 text-xs font-semibold text-[#6F6864] transition hover:border-[#991B35]/30 hover:text-[#991B35] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#991B35] px-2 text-xs font-bold text-white">
                  {page}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (posts.length === 20) {
                      setPage((prev) => prev + 1);
                    }
                  }}
                  disabled={posts.length < 20}
                  className="flex items-center gap-1.5 rounded-lg border border-[#EBE8E5] px-3 py-2 text-xs font-semibold text-[#6F6864] transition hover:border-[#991B35]/30 hover:text-[#991B35] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Post Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171414]/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedPost(null);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F0EDEA] bg-white px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#991B35]">
                  Content preview
                </p>
                <h3 className="mt-1 text-base font-bold text-[#242124]">
                  Published creation
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F3F1] text-[#77716F] transition hover:bg-[#F9EAED] hover:text-[#991B35]"
                title="Close preview"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <span
                  className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase ${getCategoryStyle(
                    selectedPost.category,
                  )}`}
                >
                  {selectedPost.category || "Unknown"}
                </span>

                <h2 className="mt-3 text-xl font-bold leading-snug text-[#242124]">
                  {selectedPost.title || "Untitled Creation"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#918984]">
                  <span>
                    By {selectedPost.author?.name || "Unknown creator"}
                  </span>
                  <span>•</span>
                  <span>{formatDate(selectedPost.createdAt)}</span>
                </div>
              </div>

              {/* Media */}
              {selectedPost.media?.url && (
                <div className="overflow-hidden rounded-xl border border-[#EBE8E5] bg-[#F7F6F4]">
                  {selectedPost.media.type === "image" ? (
                    <img
                      src={selectedPost.media.url}
                      alt={selectedPost.title || "Post media"}
                      className="max-h-80 w-full object-contain"
                    />
                  ) : (
                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#5F5854]">
                        <Music2 size={17} className="text-[#991B35]" />
                        Audio creation
                      </div>
                      <audio
                        src={selectedPost.media.url}
                        controls
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedPost.description && (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#99918D]">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed text-[#5F5854]">
                    {selectedPost.description}
                  </p>
                </div>
              )}

              {/* Written Content */}
              {selectedPost.content && (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#99918D]">
                    Content
                  </h4>
                  <div className="max-h-64 overflow-y-auto whitespace-pre-line rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-4 font-serif text-sm leading-relaxed text-[#403A37]">
                    {selectedPost.content}
                  </div>
                </div>
              )}

              {/* Engagement */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#F0EDEA] bg-[#FAF9F7] p-4">
                  <div className="flex items-center gap-2 text-[#991B35]">
                    <Heart size={16} />
                    <span className="text-xs font-semibold">Likes</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[#242124]">
                    {selectedPost.likesCount || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-[#F0EDEA] bg-[#FAF9F7] p-4">
                  <div className="flex items-center gap-2 text-[#77716F]">
                    <MessageCircle size={16} />
                    <span className="text-xs font-semibold">Comments</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-[#242124]">
                    {selectedPost.commentsCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-[#F0EDEA] bg-[#FAF9F7] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-xl border border-[#E7E2DE] bg-white px-5 py-2.5 text-xs font-semibold text-[#6F6864] transition hover:bg-[#F5F3F1]"
              >
                Close preview
              </button>

              <button
                type="button"
                onClick={() => handleDeletePost(selectedPost._id)}
                disabled={deletingId === selectedPost._id}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7E172C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === selectedPost._id ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
