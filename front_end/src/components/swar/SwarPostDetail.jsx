import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Trash2,
  LoaderCircle,
  Music2,
  Headphones,
  Disc3,
  Radio,
} from "lucide-react";

import SwarAudioPlayer from "./SwarAudioPlayer";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const getUserId = (user) => {
  if (!user) return "";
  if (typeof user === "string") return user;

  return String(user._id || user.id || user.userId || "");
};

const getInitials = (name = "User") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getAudioUrl = (post) => post?.media?.url || post?.audioUrl || "";

const getComments = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.data?.comments)) return data.data.comments;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getCommentUser = (comment) => comment?.user || comment?.author || {};

const getCommentId = (comment) => comment?._id || comment?.id || "";

const getCommentContent = (comment) => comment?.content || comment?.text || "";

const getCommentAuthorId = (comment) => getUserId(getCommentUser(comment));

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SwarPostDetail = ({
  post: initialPost,
  onClose,
  onPostUpdated,
  currentUserId,
}) => {
  const navigate = useNavigate();

  // The parent uses key={selectedPost._id}, so this component is
  // mounted fresh whenever a different post is selected.
  const postId = initialPost?._id;

  const [post, setPost] = useState(() => initialPost || {});
  const postRef = useRef(initialPost || {});

  const [comments, setComments] = useState([]);
  const commentsRef = useRef([]);

  const [commentText, setCommentText] = useState("");

  const [liked, setLiked] = useState(Boolean(initialPost?.isLiked));
  const [saved, setSaved] = useState(Boolean(initialPost?.isSaved));

  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingComment, setDeletingComment] = useState(null);
  const [error, setError] = useState("");

  const [authorImageError, setAuthorImageError] = useState(false);
  const [commentImageErrors, setCommentImageErrors] = useState({});

  const commentInputRef = useRef(null);

  // Keep the latest parent callback without changing updatePost's identity.
  const onPostUpdatedRef = useRef(onPostUpdated);
  onPostUpdatedRef.current = onPostUpdated;

  // Keep the latest close callback for the keyboard listener.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const audioUrl = getAudioUrl(post);

  const author = post?.author || {};
  const authorProfile = post?.authorProfile || {};

  const authorName =
    authorProfile?.name ||
    author?.name ||
    authorProfile?.username ||
    "Unknown creator";

  const authorUsername = authorProfile?.username || "";

  const authorImage = authorProfile?.profileImage || author?.profileImage || "";

  const authorId =
    getUserId(authorProfile?.user) ||
    getUserId(author?._id ? author : author?.user);

  const viewerId = String(currentUserId || "");

  const likesCount = Number(post?.likesCount ?? post?.likes?.length ?? 0);

  const commentsCount =
    typeof post?.commentsCount === "number"
      ? post.commentsCount
      : comments.length;

  // Update the local post and notify the parent.
  // This function has a stable identity and does not depend on props.
  const updatePost = useCallback((updatedFields) => {
    const currentPost = postRef.current;

    const hasChanges = Object.entries(updatedFields).some(
      ([key, value]) => currentPost?.[key] !== value,
    );

    if (!hasChanges) return;

    const updatedPost = {
      ...currentPost,
      ...updatedFields,
    };

    postRef.current = updatedPost;
    setPost(updatedPost);

    onPostUpdatedRef.current?.(updatedPost);
  }, []);

  const updateComments = useCallback((nextComments) => {
    commentsRef.current = nextComments;
    setComments(nextComments);
  }, []);

  // Lock background scrolling and support Escape.
  // The listener is registered only once.
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

  // Load comments, like status and saved status.
  // updatePost is stable, so this effect will not repeatedly run
  // because the parent creates a new callback.
  useEffect(() => {
    if (!postId || !API_URL) {
      setLoadingComments(false);
      return;
    }

    let cancelled = false;

    const loadPostData = async () => {
      setLoadingComments(true);
      setError("");

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

      if (cancelled) return;

      const [commentResult, likeResult, savedResult] = results;

      if (commentResult.status === "fulfilled") {
        const loadedComments = getComments(commentResult.value.data);

        updateComments(loadedComments);

        updatePost({
          commentsCount: loadedComments.length,
        });
      } else {
        console.error("Unable to load comments:", commentResult.reason);
      }

      if (likeResult.status === "fulfilled") {
        const data = likeResult.value.data;

        const serverLiked =
          typeof data?.isLiked === "boolean"
            ? data.isLiked
            : typeof data?.liked === "boolean"
              ? data.liked
              : null;

        if (serverLiked !== null) {
          setLiked(serverLiked);
          updatePost({ isLiked: serverLiked });
        }

        if (typeof data?.likeCount === "number") {
          updatePost({ likesCount: data.likeCount });
        }
      } else {
        console.error("Unable to load like status:", likeResult.reason);
      }

      if (savedResult.status === "fulfilled") {
        const data = savedResult.value.data;

        const serverSaved =
          typeof data?.isSaved === "boolean"
            ? data.isSaved
            : typeof data?.saved === "boolean"
              ? data.saved
              : null;

        if (serverSaved !== null) {
          setSaved(serverSaved);
          updatePost({ isSaved: serverSaved });
        }
      } else {
        console.error("Unable to load saved status:", savedResult.reason);
      }

      if (!cancelled) {
        setLoadingComments(false);
      }
    };

    loadPostData();

    return () => {
      cancelled = true;
    };
  }, [postId, updateComments, updatePost]);

  // Navigate to a creator's profile.
  const handleProfileClick = (userId) => {
    if (!userId) return;

    onCloseRef.current?.();
    navigate(`/profile/${userId}`);
  };

  // Like or unlike.
  const handleLike = async () => {
    if (!postId || liking || !API_URL) return;

    setLiking(true);
    setError("");

    const previousLiked = liked;

    const previousCount = Number(
      postRef.current?.likesCount ?? postRef.current?.likes?.length ?? 0,
    );

    const nextLiked = !previousLiked;

    const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);

    updatePost({
      isLiked: nextLiked,
      likesCount: nextCount,
    });

    try {
      const response = previousLiked
        ? await axios.delete(`${API_URL}/api/like/${postId}`, {
            withCredentials: true,
          })
        : await axios.post(
            `${API_URL}/api/like/${postId}`,
            {},
            { withCredentials: true },
          );

      const serverCount = response.data?.likeCount;

      if (typeof serverCount === "number") {
        updatePost({ likesCount: serverCount });
      }
    } catch (err) {
      setLiked(previousLiked);

      updatePost({
        isLiked: previousLiked,
        likesCount: previousCount,
      });

      setError(getErrorMessage(err, "Unable to update your like."));
    } finally {
      setLiking(false);
    }
  };

  // Save or unsave.
  const handleSave = async () => {
    if (!postId || saving || !API_URL) return;

    setSaving(true);
    setError("");

    const previousSaved = saved;
    const nextSaved = !previousSaved;

    setSaved(nextSaved);
    updatePost({ isSaved: nextSaved });

    try {
      if (previousSaved) {
        await axios.delete(`${API_URL}/api/saved/${postId}`, {
          withCredentials: true,
        });
      } else {
        await axios.post(
          `${API_URL}/api/saved/${postId}`,
          {},
          { withCredentials: true },
        );
      }
    } catch (err) {
      setSaved(previousSaved);
      updatePost({ isSaved: previousSaved });

      setError(
        getErrorMessage(err, "Unable to update your saved performances."),
      );
    } finally {
      setSaving(false);
    }
  };

  // Add a comment.
  const handleSubmitComment = async (event) => {
    event.preventDefault();

    const content = commentText.trim();

    if (!content || !postId || submittingComment || !API_URL) {
      return;
    }

    setSubmittingComment(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/comment/${postId}`,
        { content },
        { withCredentials: true },
      );

      const newComment =
        response.data?.comment ||
        response.data?.data?.comment ||
        response.data?.data;

      if (!newComment?._id) {
        throw new Error("The server returned an unexpected comment response.");
      }

      const updatedComments = [...commentsRef.current, newComment];

      updateComments(updatedComments);
      setCommentText("");

      updatePost({
        commentsCount: updatedComments.length,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to post your comment."));
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete a comment.
  const handleDeleteComment = async (commentId) => {
    if (!commentId || deletingComment || !API_URL) return;

    if (!window.confirm("Delete this comment?")) return;

    setDeletingComment(commentId);
    setError("");

    try {
      await axios.delete(`${API_URL}/api/comment/${commentId}`, {
        withCredentials: true,
      });

      const updatedComments = commentsRef.current.filter(
        (comment) => getCommentId(comment) !== commentId,
      );

      updateComments(updatedComments);

      updatePost({
        commentsCount: updatedComments.length,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete this comment."));
    } finally {
      setDeletingComment(null);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCloseRef.current?.();
    }
  };

  return (
    <>
      <style>{`
        @keyframes swar-wave {
          0%, 100% { transform: scaleY(0.28); opacity: 0.48; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes swar-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes swar-pulse {
          0%, 100% { transform: scale(0.96); opacity: 0.45; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @keyframes swar-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.55; }
        }

        .swar-wave-bar {
          animation: swar-wave 900ms ease-in-out infinite;
          transform-origin: center;
        }

        .swar-orbit {
          animation: swar-orbit 22s linear infinite;
        }

        .swar-pulse {
          animation: swar-pulse 3s ease-in-out infinite;
        }

        .swar-glow {
          animation: swar-glow 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .swar-wave-bar,
          .swar-orbit,
          .swar-pulse,
          .swar-glow {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-[#100D10]/75 p-0 backdrop-blur-md sm:p-5"
        onMouseDown={handleOverlayClick}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Performance details"
          className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-[#FCFBF9] shadow-2xl sm:h-[min(90vh,880px)] sm:flex-row sm:rounded-[28px]"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close post details"
            className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-black/50"
          >
            <X size={19} />
          </button>

          {/* Audio experience */}
          <div className="relative flex min-h-[370px] w-full shrink-0 flex-col justify-between overflow-hidden bg-[#171318] px-6 pb-7 pt-8 text-white sm:min-h-0 sm:w-[48%] sm:px-9 sm:py-9 lg:w-[50%]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="swar-glow absolute -left-28 top-16 h-80 w-80 rounded-full bg-[#E5092D]/15 blur-[100px]" />
              <div className="swar-glow absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#8C4264]/20 blur-[100px]" />

              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "radial-gradient(#ffffff 0.7px, transparent 0.7px)",
                  backgroundSize: "12px 12px",
                }}
              />
            </div>

            {/* Top label */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Music2 size={17} className="text-[#FF647D]" />
                </div>

                <div>
                  <p className="text-[11px] font-bold tracking-[0.24em] text-white/80">
                    PRATIVA
                  </p>
                  <p className="text-[9px] tracking-[0.2em] text-white/35">
                    SWAR MANCH
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF526D] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF526D]" />
                </span>
                <span className="text-[10px] font-medium tracking-wider text-white/65">
                  SOUND ON
                </span>
              </div>
            </div>

            {/* Record artwork */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-7">
              <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64 lg:h-72 lg:w-72">
                <div className="swar-pulse absolute inset-0 rounded-full border border-[#FF526D]/20" />
                <div className="swar-orbit absolute inset-3 rounded-full border border-dashed border-white/10" />
                <div className="absolute inset-7 rounded-full bg-[#E5092D]/10 blur-2xl" />

                <div className="relative flex h-[78%] w-[78%] items-center justify-center rounded-full border border-white/10 bg-[repeating-radial-gradient(circle_at_center,#29242B_0px,#29242B_2px,#19161B_3px,#19161B_5px)] shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                  <div className="absolute inset-[12%] rounded-full border border-white/[0.07]" />
                  <div className="absolute inset-[24%] rounded-full border border-white/[0.07]" />
                  <div className="absolute inset-[36%] rounded-full border border-white/[0.07]" />

                  <div className="relative flex h-[35%] w-[35%] items-center justify-center overflow-hidden rounded-full border-4 border-[#30242A] bg-gradient-to-br from-[#E5092D] to-[#7D1937] shadow-lg">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.3),transparent_55%)]" />
                    <Music2
                      size={31}
                      className="relative text-white sm:h-9 sm:w-9"
                    />
                  </div>
                </div>

                <div className="absolute -right-1 top-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md">
                  <Headphones size={18} className="text-[#FF7186]" />
                </div>

                <div className="absolute -bottom-1 left-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md">
                  <Radio size={17} className="text-white/65" />
                </div>
              </div>

              {/* Equalizer */}
              <div className="mt-8 flex h-10 items-center justify-center gap-[5px]">
                {Array.from({ length: 39 }).map((_, index) => {
                  const height = 10 + Math.abs(Math.sin(index * 0.7)) * 25;

                  return (
                    <span
                      key={index}
                      className="swar-wave-bar w-[3px] rounded-full bg-gradient-to-t from-[#E5092D] to-[#FF8B9C]"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${(index % 9) * -110}ms`,
                        animationDuration: `${650 + (index % 5) * 150}ms`,
                      }}
                    />
                  );
                })}
              </div>

              <p className="mt-3 text-[9px] font-semibold tracking-[0.35em] text-white/35">
                A MOMENT IN SOUND
              </p>
            </div>

            {/* Track information and player */}
            <div className="relative z-10">
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FF7186]">
                  <Disc3 size={13} />
                  <span>Now presenting</span>
                </div>

                <h2 className="max-w-full break-words font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl">
                  {post?.title || "Untitled performance"}
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  {authorName}
                  {post?.subCategory
                    ? ` · ${String(post.subCategory).replaceAll("-", " ")}`
                    : ""}
                </p>
              </div>

              {audioUrl ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 shadow-xl backdrop-blur-xl sm:p-4">
                  <SwarAudioPlayer key={audioUrl} src={audioUrl} />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm text-white/50">
                  Audio is unavailable.
                </div>
              )}

              <div className="mt-5 flex items-center justify-between text-xs text-white/45">
                <span className="flex items-center gap-2">
                  <Heart size={14} />
                  {likesCount} likes
                </span>

                <span className="flex items-center gap-2">
                  <MessageCircle size={14} />
                  {commentsCount} comments
                </span>
              </div>
            </div>
          </div>

          {/* Creator, post details and conversation */}
          <div className="flex min-h-0 w-full flex-1 flex-col bg-[#FCFBF9] sm:w-[52%] lg:w-[50%]">
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-16 sm:px-8 sm:pt-9">
              {/* Creator */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleProfileClick(authorId)}
                  disabled={!authorId}
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7E2] text-sm font-semibold text-[#655B55] disabled:cursor-default"
                >
                  {authorImage && !authorImageError ? (
                    <img
                      src={authorImage}
                      alt={authorName}
                      className="h-full w-full object-cover"
                      onError={() => setAuthorImageError(true)}
                    />
                  ) : (
                    getInitials(authorName)
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleProfileClick(authorId)}
                    disabled={!authorId}
                    className="block max-w-full truncate text-sm font-semibold text-[#292523] transition hover:text-[#E5092D] disabled:cursor-default"
                  >
                    {authorName}
                  </button>

                  {authorUsername && (
                    <p className="truncate text-xs text-[#99918B]">
                      @{authorUsername}
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-xs text-[#99918B]">
                  {formatDate(post?.createdAt)}
                </span>
              </div>

              {/* Description */}
              {post?.description && (
                <div className="mt-7">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#5F5853]">
                    {post.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(post?.tags) && post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full bg-[#F1ECE8] px-3 py-1.5 text-xs text-[#82766E]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Interaction bar */}
              <div className="mt-7 flex items-center justify-between border-y border-[#EEE9E4] py-4">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={liking}
                    aria-label={
                      liked ? "Unlike performance" : "Like performance"
                    }
                    className={`flex items-center gap-2 text-sm transition disabled:opacity-50 ${
                      liked
                        ? "text-[#E5092D]"
                        : "text-[#716963] hover:text-[#E5092D]"
                    }`}
                  >
                    {liking ? (
                      <LoaderCircle size={19} className="animate-spin" />
                    ) : (
                      <Heart size={19} fill={liked ? "currentColor" : "none"} />
                    )}
                    <span>{likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => commentInputRef.current?.focus()}
                    className="flex items-center gap-2 text-sm text-[#716963] transition hover:text-[#E5092D]"
                  >
                    <MessageCircle size={19} />
                    <span>{comments.length}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  aria-label={
                    saved ? "Remove from saved posts" : "Save performance"
                  }
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    saved
                      ? "bg-[#FCE8EC] text-[#E5092D]"
                      : "bg-[#F1ECE8] text-[#716963] hover:bg-[#FCE8EC] hover:text-[#E5092D]"
                  }`}
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Bookmark
                      size={17}
                      fill={saved ? "currentColor" : "none"}
                    />
                  )}

                  {saved ? "Saved" : "Save"}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Conversation */}
              <div className="mb-5 mt-7 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B0A49B]">
                    Community
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-[#292523]">
                    Conversation
                  </h3>
                </div>

                <span className="rounded-full bg-[#F1ECE8] px-3 py-1.5 text-xs text-[#82766E]">
                  {comments.length} thoughts
                </span>
              </div>

              {/* Comments */}
              {loadingComments ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#99918B]">
                  <LoaderCircle size={17} className="animate-spin" />
                  Loading conversation...
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5DDD6] px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1ECE8] text-[#9B8F86]">
                    <MessageCircle size={21} />
                  </div>

                  <p className="font-serif text-lg text-[#625A54]">
                    A quiet beginning.
                  </p>

                  <p className="mt-1 text-xs text-[#A39A93]">
                    Be the first to share what you felt.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const commentId = getCommentId(comment);
                    const commentUser = getCommentUser(comment);

                    const commentName =
                      commentUser?.name || commentUser?.username || "User";

                    const commentUsername = commentUser?.username || "";

                    const commentImage = commentUser?.profileImage || "";

                    const commentUserId = getCommentAuthorId(comment);

                    const canDelete = Boolean(
                      viewerId && commentUserId && viewerId === commentUserId,
                    );

                    const imageFailed = commentImageErrors[commentId];

                    return (
                      <article
                        key={commentId}
                        className="flex items-start gap-3"
                      >
                        <button
                          type="button"
                          onClick={() => handleProfileClick(commentUserId)}
                          disabled={!commentUserId}
                          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE7E2] text-xs font-semibold text-[#655B55] disabled:cursor-default"
                        >
                          {commentImage && !imageFailed ? (
                            <img
                              src={commentImage}
                              alt={commentName}
                              className="h-full w-full object-cover"
                              onError={() =>
                                setCommentImageErrors((previous) => ({
                                  ...previous,
                                  [commentId]: true,
                                }))
                              }
                            />
                          ) : (
                            getInitials(commentName)
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <button
                              type="button"
                              onClick={() => handleProfileClick(commentUserId)}
                              disabled={!commentUserId}
                              className="text-sm font-semibold text-[#332D29] transition hover:text-[#E5092D] disabled:cursor-default"
                            >
                              {commentName}
                            </button>

                            {commentUsername && (
                              <span className="text-xs text-[#A39A93]">
                                @{commentUsername}
                              </span>
                            )}

                            <span className="text-xs text-[#B2AAA3]">
                              {formatDate(comment.createdAt)}
                            </span>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(commentId)}
                                disabled={deletingComment === commentId}
                                aria-label="Delete comment"
                                className="ml-auto flex items-center gap-1 text-xs text-[#A39A93] transition hover:text-red-600 disabled:opacity-50"
                              >
                                {deletingComment === commentId ? (
                                  <LoaderCircle
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
                          </div>

                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#625A54]">
                            {getCommentContent(comment)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comment input */}
            <form
              onSubmit={handleSubmitComment}
              className="flex shrink-0 items-center gap-3 border-t border-[#EEE9E4] bg-white px-4 py-4 sm:px-7"
            >
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={1000}
                placeholder="Share what you felt..."
                className="min-w-0 flex-1 rounded-full border border-[#EEE9E4] bg-[#FAF9F7] px-4 py-3 text-sm text-[#292523] outline-none transition placeholder:text-[#AAA19A] focus:border-[#E5092D]"
              />

              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                aria-label="Send comment"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5092D] text-white transition hover:bg-[#C90024] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submittingComment ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default SwarPostDetail;
