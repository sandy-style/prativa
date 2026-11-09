import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Trash2,
  LoaderCircle,
  Feather,
  BookOpen,
  CalendarDays,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const FONT_STYLES = {
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: '"Plus Jakarta Sans", Arial, sans-serif',
  devanagari: '"Noto Serif Devanagari", serif',
  handwritten: '"Segoe Print", "Comic Sans MS", cursive',
};

const getId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || null;
};

const getCommentUser = (comment) => {
  return comment?.user || comment?.author || {};
};

const getCommentId = (comment) => {
  return comment?._id || comment?.id || null;
};

const getCommentContent = (comment) => {
  return comment?.content || comment?.text || "";
};

const getCommentAuthorId = (comment) => {
  return getId(getCommentUser(comment));
};

const getAuthorName = (post) => {
  const author = post?.authorProfile || post?.author || {};

  return author?.name || post?.authorName || post?.username || "Anonymous";
};

const getUsername = (post) => {
  const author = post?.authorProfile || post?.author || {};

  return author?.username || post?.username || "";
};

const getProfileImage = (person) => {
  return person?.profileImage || person?.avatar || person?.image || "";
};

const getInitials = (name) => {
  if (!name) return "A";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getComments = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.data?.comments)) return data.data.comments;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const ShabdaPostDetails = ({
  post: initialPost,
  onClose,
  onPostUpdated,
  currentUserId,
}) => {
  const postId = initialPost?._id;

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [liked, setLiked] = useState(Boolean(initialPost?.isLiked));
  const [saved, setSaved] = useState(Boolean(initialPost?.isSaved));

  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const [commentsError, setCommentsError] = useState("");
  const [actionError, setActionError] = useState("");

  const commentsRef = useRef([]);
  const onCloseRef = useRef(onClose);
  const onPostUpdatedRef = useRef(onPostUpdated);
  const postRef = useRef(initialPost);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onPostUpdatedRef.current = onPostUpdated;
  }, [onPostUpdated]);

  const updateComments = useCallback((nextComments) => {
    commentsRef.current = nextComments;
    setComments(nextComments);
  }, []);

  const updatePost = useCallback((updates) => {
    const updatedPost = {
      ...postRef.current,
      ...updates,
    };

    postRef.current = updatedPost;
    setPost(updatedPost);
    onPostUpdatedRef.current?.(updatedPost);
  }, []);

  // ==========================================
  // BODY SCROLL + ESCAPE
  // ==========================================

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ==========================================
  // LOAD COMMENTS, LIKE AND SAVE STATUS
  // ==========================================

  useEffect(() => {
    if (!postId) return;

    let active = true;

    const loadDetails = async () => {
      setLoadingComments(true);
      setCommentsError("");

      const results = await Promise.allSettled([
        axios.get(`${API_URL}/api/comment/${postId}`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/like/${postId}`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/saved/${postId}`, {
          withCredentials: true,
        }),
      ]);

      if (!active) return;

      const [commentResult, likeResult, savedResult] = results;

      if (commentResult.status === "fulfilled") {
        updateComments(getComments(commentResult.value));
      } else {
        setCommentsError(
          getErrorMessage(commentResult.reason, "Unable to load comments."),
        );
      }

      if (likeResult.status === "fulfilled") {
        const data = likeResult.value?.data;

        const isLiked =
          data?.isLiked ??
          data?.liked ??
          data?.data?.isLiked ??
          data?.data?.liked;

        if (typeof isLiked === "boolean") {
          setLiked(isLiked);
        }

        const likesCount =
          data?.likeCount ??
          data?.likesCount ??
          data?.data?.likeCount ??
          data?.data?.likesCount;

        if (
          likesCount !== undefined &&
          Number.isFinite(Number(likesCount)) &&
          Number(likesCount) !== Number(postRef.current?.likesCount ?? 0)
        ) {
          updatePost({ likesCount: Number(likesCount) });
        }
      }

      if (savedResult.status === "fulfilled") {
        const data = savedResult.value?.data;

        const isSaved =
          data?.isSaved ??
          data?.saved ??
          data?.data?.isSaved ??
          data?.data?.saved;

        if (typeof isSaved === "boolean") {
          setSaved(isSaved);
        }
      }

      setLoadingComments(false);
    };

    loadDetails();

    return () => {
      active = false;
    };
  }, [postId, updateComments, updatePost]);

  // ==========================================
  // LIKE
  // ==========================================

  const handleLike = async () => {
    if (!postId || liking) return;

    setActionError("");
    setLiking(true);

    const previousLiked = liked;
    const previousCount = Number(post?.likesCount || 0);
    const nextLiked = !previousLiked;

    setLiked(nextLiked);

    updatePost({
      isLiked: nextLiked,
      likesCount: Math.max(0, previousCount + (nextLiked ? 1 : -1)),
    });

    try {
      const response = nextLiked
        ? await axios.post(
            `${API_URL}/api/like/${postId}`,
            {},
            { withCredentials: true },
          )
        : await axios.delete(`${API_URL}/api/like/${postId}`, {
            withCredentials: true,
          });

      const serverCount =
        response?.data?.likeCount ??
        response?.data?.likesCount ??
        response?.data?.data?.likeCount;

      if (serverCount !== undefined && Number.isFinite(Number(serverCount))) {
        updatePost({ likesCount: Number(serverCount) });
      }
    } catch (error) {
      setLiked(previousLiked);

      updatePost({
        isLiked: previousLiked,
        likesCount: previousCount,
      });

      setActionError(getErrorMessage(error, "Unable to update your like."));
    } finally {
      setLiking(false);
    }
  };

  // ==========================================
  // BOOKMARK
  // ==========================================

  const handleSave = async () => {
    if (!postId || saving) return;

    setActionError("");
    setSaving(true);

    const previousSaved = saved;
    const nextSaved = !previousSaved;

    setSaved(nextSaved);
    updatePost({ isSaved: nextSaved });

    try {
      if (nextSaved) {
        await axios.post(
          `${API_URL}/api/saved/${postId}`,
          {},
          { withCredentials: true },
        );
      } else {
        await axios.delete(`${API_URL}/api/saved/${postId}`, {
          withCredentials: true,
        });
      }
    } catch (error) {
      setSaved(previousSaved);
      updatePost({ isSaved: previousSaved });

      setActionError(getErrorMessage(error, "Unable to update your bookmark."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // SUBMIT COMMENT
  // ==========================================

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    const content = commentText.trim();

    if (!content || submittingComment || !postId) return;

    setSubmittingComment(true);
    setActionError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/comment/${postId}`,
        { content },
        { withCredentials: true },
      );

      const newComment =
        response?.data?.comment ||
        response?.data?.data?.comment ||
        response?.data?.data;

      if (!newComment?._id) {
        throw new Error("The server did not return the created comment.");
      }

      const nextComments = [...commentsRef.current, newComment];

      updateComments(nextComments);
      setCommentText("");

      updatePost({
        commentsCount: nextComments.length,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to publish your comment."));
    } finally {
      setSubmittingComment(false);
    }
  };

  // ==========================================
  // DELETE COMMENT
  // ==========================================

  const handleDeleteComment = async (comment) => {
    const commentId = getCommentId(comment);

    if (!commentId || deletingCommentId) return;

    const commentAuthorId = getCommentAuthorId(comment);

    if (
      !currentUserId ||
      !commentAuthorId ||
      String(currentUserId) !== String(commentAuthorId)
    ) {
      return;
    }

    if (!window.confirm("Delete this comment?")) return;

    setDeletingCommentId(commentId);
    setActionError("");

    const previousComments = commentsRef.current;

    const nextComments = previousComments.filter(
      (item) => getCommentId(item) !== commentId,
    );

    updateComments(nextComments);

    updatePost({
      commentsCount: nextComments.length,
    });

    try {
      await axios.delete(`${API_URL}/api/comment/${commentId}`, {
        withCredentials: true,
      });
    } catch (error) {
      updateComments(previousComments);
      updatePost({ commentsCount: previousComments.length });

      setActionError(getErrorMessage(error, "Unable to delete this comment."));
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (!initialPost) return null;

  const author = post?.authorProfile || post?.author || {};
  const authorName = getAuthorName(post);
  const username = getUsername(post);
  const authorImage = getProfileImage(author);

  const tags = Array.isArray(post?.tags) ? post.tags : [];

  const likesCount = Number(post?.likesCount ?? 0);
  const commentsCount = comments.length;

  const fontFamily = FONT_STYLES[post?.fontStyle] || FONT_STYLES.serif;

  const textAlign = ["left", "center", "right"].includes(post?.textAlign)
    ? post.textAlign
    : "left";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080503]/85 p-0 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current?.();
        }
      }}
    >
      {/* MODAL */}
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden border border-[#F97316]/20 bg-[#17100B] shadow-[0_25px_90px_rgba(0,0,0,0.65),0_0_35px_rgba(249,115,22,0.07)] sm:h-[min(90vh,850px)] sm:rounded-2xl">
        {/* HEADER */}
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#F97316]/15 bg-[#1D140D] px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F97316]/25 bg-[#2A1B11] text-[#FB923C] shadow-[0_0_16px_rgba(249,115,22,0.08)]">
              <Feather size={17} />
            </div>

            <div>
              <p className="font-[Orbitron] text-[11px] font-bold uppercase tracking-[0.2em] text-[#FB923C]">
                PRATIVA
              </p>

              <p className="text-[10px] text-[#A9917C]">
                Shabda Manch · Written work
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close post details"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[#A9917C] transition hover:border-[#F97316]/30 hover:bg-[#F97316]/10 hover:text-[#FB923C]"
          >
            <X size={19} />
          </button>
        </header>

        {/* MAIN CONTENT */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* FULL READING AREA */}
          <main className="relative min-h-0 overflow-y-auto bg-[#17100B] px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
            {/* READING AREA GLOW */}
            <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#F97316]/[0.045] blur-[110px]" />

            <article className="relative mx-auto max-w-2xl">
              <div className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FB923C]">
                <BookOpen size={14} />
                <span>A piece of expression</span>
              </div>

              {post?.title && (
                <h1 className="mb-7 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#FFF3E8] sm:text-4xl lg:text-[42px]">
                  {post.title}
                </h1>
              )}

              {/* FULL POST CONTENT */}
              <div
                className="whitespace-pre-wrap break-words text-[17px] leading-[2.15] text-[#E0CDBB] sm:text-[19px]"
                style={{
                  fontFamily,
                  textAlign,
                  overflowWrap: "anywhere",
                }}
              >
                {post?.content}
              </div>

              {post?.description && (
                <div className="mt-10 border-l-2 border-[#F97316]/60 py-1 pl-4">
                  <p className="text-sm leading-7 text-[#B9A18D]">
                    {post.description}
                  </p>
                </div>
              )}

              {/* TAGS */}
              {tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-[#F97316]/20 bg-[#F97316]/[0.07] px-3 py-1.5 text-[11px] font-medium text-[#FDBA74]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* AUTHOR INFORMATION */}
              <div className="mt-12 border-t border-[#F97316]/15 pt-6">
                <div className="flex items-center gap-3">
                  {authorImage ? (
                    <img
                      src={authorImage}
                      alt={authorName}
                      className="h-11 w-11 rounded-full border border-[#F97316]/25 object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F97316]/25 bg-[#2A1B11] text-sm font-semibold text-[#FDBA74]">
                      {getInitials(authorName)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#FFF3E8]">
                      {authorName}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#A9917C]">
                      {username && <span>@{username}</span>}

                      {post?.createdAt && (
                        <>
                          {username && <span>·</span>}
                          <CalendarDays size={12} />
                          <span>{formatDate(post.createdAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </main>

          {/* INTERACTION AND COMMENTS PANEL */}
          <aside className="flex min-h-0 flex-col border-t border-[#F97316]/15 bg-[#1D140D] lg:border-l lg:border-t-0">
            {/* POST ACTIONS */}
            <div className="shrink-0 border-b border-[#F97316]/15 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={liking}
                  onClick={handleLike}
                  className={`flex items-center gap-2 text-sm transition disabled:opacity-50 ${
                    liked
                      ? "text-[#FB923C]"
                      : "text-[#B9A18D] hover:text-[#FB923C]"
                  }`}
                >
                  <Heart size={19} fill={liked ? "currentColor" : "none"} />

                  <span className="font-semibold">{likesCount}</span>
                  <span className="text-xs">Likes</span>
                </button>

                <div className="flex items-center gap-1.5 text-sm text-[#B9A18D]">
                  <MessageCircle size={18} />
                  <span className="font-semibold">{commentsCount}</span>
                  <span className="text-xs">Comments</span>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  aria-label={saved ? "Remove bookmark" : "Bookmark post"}
                  className={`transition disabled:opacity-50 ${
                    saved
                      ? "text-[#FB923C]"
                      : "text-[#B9A18D] hover:text-[#FB923C]"
                  }`}
                >
                  <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              {actionError && (
                <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs leading-relaxed text-red-300">
                  {actionError}
                </p>
              )}
            </div>

            {/* COMMENTS HEADING */}
            <div className="shrink-0 px-5 pb-3 pt-5 sm:px-6">
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="text-[#FB923C]" />

                <h2 className="text-sm font-semibold text-[#FFF3E8]">
                  Conversation
                </h2>
              </div>

              <p className="mt-1 text-[11px] text-[#A9917C]">
                Thoughts shared around these words
              </p>
            </div>

            {/* COMMENTS LIST */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-5 sm:px-6">
              {loadingComments ? (
                <div className="flex items-center justify-center gap-2 py-12 text-xs text-[#A9917C]">
                  <LoaderCircle
                    size={16}
                    className="animate-spin text-[#FB923C]"
                  />
                  Loading conversation...
                </div>
              ) : commentsError ? (
                <div className="rounded-xl border border-[#F97316]/15 bg-[#24180F] px-4 py-6 text-center">
                  <p className="text-xs leading-6 text-[#FDBA74]">
                    {commentsError}
                  </p>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#2A1B11] text-[#FB923C]">
                    <MessageCircle size={20} />
                  </div>

                  <p className="text-sm font-semibold text-[#EBD5C2]">
                    No comments yet
                  </p>

                  <p className="mt-1 max-w-[220px] text-xs leading-6 text-[#A9917C]">
                    Start the conversation with a thoughtful response.
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  const commentUser = getCommentUser(comment);
                  const commentName =
                    commentUser?.name || comment?.authorName || "Anonymous";

                  const commentImage = getProfileImage(commentUser);
                  const commentId = getCommentId(comment);

                  const canDelete =
                    currentUserId &&
                    getCommentAuthorId(comment) &&
                    String(currentUserId) ===
                      String(getCommentAuthorId(comment));

                  return (
                    <div key={commentId} className="flex items-start gap-3">
                      {commentImage ? (
                        <img
                          src={commentImage}
                          alt={commentName}
                          className="h-8 w-8 shrink-0 rounded-full border border-[#F97316]/20 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#2A1B11] text-[10px] font-semibold text-[#FDBA74]">
                          {getInitials(commentName)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 rounded-xl border border-[#F97316]/10 bg-[#24180F] px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-[#FFF3E8]">
                            {commentName}
                          </p>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-[#8F7A68]">
                              {formatDate(comment.createdAt)}
                            </span>

                            {canDelete && (
                              <button
                                type="button"
                                disabled={deletingCommentId === commentId}
                                onClick={() => handleDeleteComment(comment)}
                                aria-label="Delete comment"
                                className="text-[#8F7A68] transition hover:text-[#FB923C] disabled:opacity-50"
                              >
                                {deletingCommentId === commentId ? (
                                  <LoaderCircle
                                    size={13}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-6 text-[#D5C0AC]">
                          {getCommentContent(comment)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* COMMENT INPUT */}
            <form
              onSubmit={handleSubmitComment}
              className="shrink-0 border-t border-[#F97316]/15 bg-[#19110B] p-4 sm:px-5"
            >
              <div className="flex items-end gap-2 rounded-xl border border-[#F97316]/20 bg-[#24180F] px-3 py-2 transition focus-within:border-[#FB923C]/60 focus-within:ring-2 focus-within:ring-[#F97316]/10">
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Share your thoughts..."
                  rows={1}
                  maxLength={2000}
                  className="max-h-28 min-h-[38px] flex-1 resize-y bg-transparent py-2 text-xs leading-5 text-[#FFF3E8] outline-none placeholder:text-[#8F7A68]"
                />

                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  aria-label="Send comment"
                  className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-white shadow-[0_0_14px_rgba(249,115,22,0.18)] transition hover:bg-[#EA650F] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submittingComment ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-right text-[10px] text-[#8F7A68]">
                {commentText.length}/2000 · Enter to send
              </p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ShabdaPostDetails;
