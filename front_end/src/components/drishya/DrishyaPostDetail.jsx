import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Download,
  Share2,
  Send,
  Trash2,
  LoaderCircle,
  Maximize2,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const FALLBACK_AVATAR = "https://placehold.co/100x100?text=User";

const DrishyaPostDetail = ({
  post: initialPost,
  onClose,
  onPostUpdated,
  currentUserId,
}) => {
  const navigate = useNavigate();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(initialPost?.likesCount || 0);

  const [loadingComments, setLoadingComments] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const commentInputRef = useRef(null);

  const postId = post?._id;
  const image = post?.media?.url || post?.image || "";

  const authorName = post?.author?.name || "Unknown creator";
  const username = post?.authorProfile?.username || "creator";

  const profileImage =
    post?.authorProfile?.profileImage ||
    post?.author?.profileImage ||
    FALLBACK_AVATAR;

  const description = post?.description || post?.caption || "";

  const getUserId = (user) => {
    if (!user) return null;
    if (typeof user === "string") return user;
    return user._id || user.id || null;
  };

  const authorId =
    getUserId(post?.author) ||
    getUserId(post?.authorProfile?.user) ||
    getUserId(post?.user);

  const openProfile = (userId) => {
    if (!userId) return;
    onClose?.();
    navigate(`/profile/${userId}`);
  };

  const updatePost = (updates) => {
    setPost((previous) => {
      const updated = { ...previous, ...updates };
      onPostUpdated?.(updated);
      return updated;
    });
  };

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setLoadingComments(true);

    try {
      const response = await axios.get(`${API_URL}/api/comment/${postId}`, {
        withCredentials: true,
      });

      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Unable to load comments:", error);
      setMessage(error.response?.data?.message || "Unable to load comments.");
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  const fetchInteractionStatus = useCallback(async () => {
    if (!postId) return;

    const [likeResponse, saveResponse] = await Promise.allSettled([
      axios.get(`${API_URL}/api/like/${postId}`, {
        withCredentials: true,
      }),
      axios.get(`${API_URL}/api/saved/${postId}`, {
        withCredentials: true,
      }),
    ]);

    if (likeResponse.status === "fulfilled") {
      setLiked(Boolean(likeResponse.value.data.liked));
      setLikesCount(likeResponse.value.data.likeCount ?? 0);
    }

    if (saveResponse.status === "fulfilled") {
      setSaved(Boolean(saveResponse.value.data.saved));
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
    fetchInteractionStatus();
  }, [fetchComments, fetchInteractionStatus]);

  // Lock background scrolling and support Escape.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (imageViewerOpen) {
          setImageViewerOpen(false);
        } else if (menuOpen) {
          setMenuOpen(false);
        } else {
          onClose?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, imageViewerOpen, onClose]);

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);
    setMessage("");

    try {
      const nextLiked = !liked;

      const response = nextLiked
        ? await axios.post(
            `${API_URL}/api/like/${postId}`,
            {},
            { withCredentials: true },
          )
        : await axios.delete(`${API_URL}/api/like/${postId}`, {
            withCredentials: true,
          });

      const nextCount =
        response.data.likeCount ??
        Math.max(0, likesCount + (nextLiked ? 1 : -1));

      setLiked(nextLiked);
      setLikesCount(nextCount);
      updatePost({ likesCount: nextCount });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Please log in and create a profile to like this photograph.",
      );
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      if (saved) {
        await axios.delete(`${API_URL}/api/saved/${postId}`, {
          withCredentials: true,
        });
        setSaved(false);
      } else {
        await axios.post(
          `${API_URL}/api/saved/${postId}`,
          {},
          { withCredentials: true },
        );
        setSaved(true);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Please log in and create a profile to save photographs.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    const content = commentText.trim();

    if (!content || sendingComment) return;

    setSendingComment(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/api/comment/${postId}`,
        { content },
        { withCredentials: true },
      );

      if (response.data.comment) {
        setComments((previous) => [...previous, response.data.comment]);

        updatePost({
          commentsCount: (post.commentsCount || 0) + 1,
        });
      }

      setCommentText("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Please log in and create a profile before commenting.",
      );
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/comment/${commentId}`, {
        withCredentials: true,
      });

      setComments((previous) =>
        previous.filter((comment) => comment._id !== commentId),
      );

      updatePost({
        commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to delete this comment.",
      );
    }
  };

  const handleDownload = async () => {
    if (!image || downloading) return;

    setDownloading(true);
    setMenuOpen(false);

    try {
      const response = await fetch(image);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${(post.title || "prativa-photograph")
        .trim()
        .replace(/[^a-z0-9-_]/gi, "-")}.jpg`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Unable to download this photograph.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setMenuOpen(false);

    const shareUrl = `${window.location.origin}/explore/drishya-manch/${postId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || "Photograph on Prativa",
          text: `A photograph by ${authorName} on Prativa.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setMessage("Post link copied.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessage("Unable to share this post.");
      }
    }
  };

  const handleCommentClick = () => {
    commentInputRef.current?.focus();
  };

  return (
    <>
      {/* Main post detail modal */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020813]/90 p-3 backdrop-blur-md sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose?.();
        }}
      >
        <div className="relative flex w-[min(95vw,560px)] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-[#173047] bg-[#071525] shadow-[0_20px_100px_rgba(0,0,0,0.55)] md:w-fit md:max-w-[95vw] md:flex-row md:items-stretch">
          {/* Photograph section */}
          <div className="flex w-full shrink-0 items-center justify-center overflow-hidden bg-[#030B16] md:w-fit md:max-w-[calc(95vw-390px-24px)] lg:max-w-[calc(95vw-420px-24px)]">
            {image ? (
              <button
                type="button"
                onClick={() => setImageViewerOpen(true)}
                className="group relative block h-full w-full cursor-zoom-in md:h-auto md:w-fit"
                aria-label="View photograph individually"
              >
                <img
                  src={image}
                  alt={post.title || "Photograph"}
                  className="mx-auto block h-auto w-auto max-h-[45vh] max-w-full object-contain md:mx-0 md:max-h-[88vh] md:max-w-[calc(95vw-390px-24px)] lg:max-w-[calc(95vw-420px-24px)]"
                />

                <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#071525]/85 px-4 py-2 text-xs text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                  <Maximize2 size={15} className="text-[#00D4FF]" />
                  View full image
                </span>
              </button>
            ) : (
              <div className="flex min-h-[240px] w-full items-center justify-center">
                <p className="text-sm text-slate-500">Photograph unavailable</p>
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="flex min-h-0 w-full shrink-0 flex-col bg-[#071525] md:w-[390px] md:max-h-[88vh] lg:w-[420px]">
            {/* Creator header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#173047] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => openProfile(authorId)}
                  disabled={!authorId}
                  aria-label={`View ${authorName}'s profile`}
                  className="shrink-0 rounded-full disabled:cursor-default"
                >
                  <img
                    src={profileImage}
                    alt={authorName}
                    className="h-11 w-11 rounded-full border border-[#00D4FF]/30 object-cover transition hover:border-[#00D4FF]"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_AVATAR;
                    }}
                  />
                </button>

                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openProfile(authorId)}
                    disabled={!authorId}
                    className="block max-w-full truncate text-left text-sm font-semibold text-white transition hover:text-[#00D4FF] disabled:cursor-default"
                  >
                    {authorName}
                  </button>

                  <button
                    type="button"
                    onClick={() => openProfile(authorId)}
                    disabled={!authorId}
                    className="block truncate text-xs text-slate-500 transition hover:text-[#00D4FF] disabled:cursor-default"
                  >
                    @{username}
                  </button>
                </div>
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMenuOpen((previous) => !previous)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#102438] hover:text-[#00D4FF]"
                  aria-label="Post options"
                >
                  <MoreHorizontal size={22} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-[#1C3B53] bg-[#0B1D30] py-1 shadow-2xl">
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-[#102B40] hover:text-[#00D4FF]"
                    >
                      {downloading ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Download size={17} />
                      )}
                      Download photograph
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-[#102B40] hover:text-[#00D4FF]"
                    >
                      <Share2 size={17} />
                      Share photograph
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title and description */}
            <div className="shrink-0 border-b border-[#173047] px-5 py-5">
              {post.title && (
                <h2 className="font-serif text-2xl text-white">{post.title}</h2>
              )}

              {description && (
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                  {description}
                </p>
              )}

              {post.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#00D4FF]/15 bg-[#00D4FF]/[0.06] px-3 py-1 text-xs text-[#72DDF2]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="min-h-[160px] flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-white">Conversation</h3>

                <span className="text-xs text-slate-500">
                  {comments.length} comments
                </span>
              </div>

              {loadingComments ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                  <LoaderCircle
                    size={17}
                    className="animate-spin text-[#00D4FF]"
                  />
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="py-10 text-center">
                  <MessageCircle
                    size={27}
                    className="mx-auto mb-3 text-[#31536A]"
                  />

                  <p className="font-serif text-lg text-slate-300">
                    Start the conversation.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Be the first to leave a thought.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {comments.map((comment) => {
                    const commentUserId = getUserId(comment.user);

                    const isOwnComment =
                      currentUserId &&
                      commentUserId?.toString() === currentUserId.toString();

                    const commentName = comment.user?.name || "Creator";

                    const commentAvatar =
                      comment.userProfile?.profileImage || FALLBACK_AVATAR;

                    return (
                      <div key={comment._id} className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => openProfile(commentUserId)}
                          disabled={!commentUserId}
                          aria-label={`View ${commentName}'s profile`}
                          className="h-9 w-9 shrink-0 rounded-full disabled:cursor-default"
                        >
                          <img
                            src={commentAvatar}
                            alt={commentName}
                            className="h-9 w-9 rounded-full border border-[#173047] object-cover transition hover:border-[#00D4FF]"
                            onError={(event) => {
                              event.currentTarget.src = FALLBACK_AVATAR;
                            }}
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => openProfile(commentUserId)}
                                disabled={!commentUserId}
                                className="truncate text-sm font-semibold text-slate-200 transition hover:text-[#00D4FF] disabled:cursor-default"
                              >
                                {commentName}
                              </button>

                              {comment.userProfile?.username && (
                                <button
                                  type="button"
                                  onClick={() => openProfile(commentUserId)}
                                  disabled={!commentUserId}
                                  className="ml-2 text-xs text-slate-500 transition hover:text-[#00D4FF] disabled:cursor-default"
                                >
                                  @{comment.userProfile.username}
                                </button>
                              )}
                            </div>

                            {isOwnComment && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment._id)}
                                className="shrink-0 text-slate-600 transition hover:text-red-400"
                                aria-label="Delete comment"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-400">
                            {comment.content}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions and comment form */}
            <div className="shrink-0 border-t border-[#173047] bg-[#061321] px-5 py-4">
              {message && (
                <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">
                  {message}
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={liking}
                    className={`flex items-center gap-2 transition ${
                      liked
                        ? "text-[#00D4FF]"
                        : "text-slate-400 hover:text-[#00D4FF]"
                    }`}
                    aria-label={liked ? "Unlike post" : "Like post"}
                  >
                    <Heart size={23} fill={liked ? "currentColor" : "none"} />
                    <span className="text-sm">{likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCommentClick}
                    className="flex items-center gap-2 text-slate-400 transition hover:text-[#00D4FF]"
                    aria-label="Write a comment"
                  >
                    <MessageCircle size={22} />
                    <span className="text-sm">{comments.length}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`transition ${
                    saved
                      ? "text-[#00D4FF]"
                      : "text-slate-400 hover:text-[#00D4FF]"
                  }`}
                  aria-label={saved ? "Remove saved post" : "Save post"}
                >
                  <Bookmark size={22} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Leave a thought..."
                  maxLength={1000}
                  className="min-w-0 flex-1 rounded-full border border-[#1C3B53] bg-[#0B1D30] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/20"
                />

                <button
                  type="submit"
                  disabled={!commentText.trim() || sendingComment}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00D4FF] text-[#03111D] transition hover:bg-[#67E5F7] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send comment"
                >
                  {sendingComment ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Individual full-screen image viewer */}
      {imageViewerOpen && image && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020813]/[0.98] p-3 sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setImageViewerOpen(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setImageViewerOpen(false)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0B1D30] text-white transition hover:border-[#00D4FF]/50 hover:text-[#00D4FF]"
            aria-label="Close image viewer"
          >
            <X size={21} />
          </button>

          <img
            src={image}
            alt={post.title || "Full photograph"}
            className="max-h-full max-w-full select-none object-contain"
            draggable="false"
          />
        </div>
      )}
    </>
  );
};

export default DrishyaPostDetail;
