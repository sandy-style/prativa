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
  AudioLines,
  Play,
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

const getAudioUrl = (post) => {
  const media = post?.media;
  const audio = post?.audio;

  if (typeof media === "string") return media;
  if (typeof media?.url === "string") return media.url;

  if (typeof audio === "string") return audio;
  if (typeof audio?.url === "string") return audio.url;

  return post?.audioUrl || post?.mediaUrl || "";
};

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

const formatCount = (value) => {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) return "0";

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return String(count);
};

const SwarPostDetail = ({
  post: initialPost,
  onClose,
  onPostUpdated,
  currentUserId,
}) => {
  const navigate = useNavigate();

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

  const onPostUpdatedRef = useRef(onPostUpdated);
  onPostUpdatedRef.current = onPostUpdated;

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

  // Update post and notify parent.
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

  // Load comments, likes and saved status.
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

  // Navigate to creator profile.
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

    if (!content || !postId || submittingComment || !API_URL) return;

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
          0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes swar-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes swar-pulse {
          0%, 100% { transform: scale(0.96); opacity: 0.35; }
          50% { transform: scale(1.04); opacity: 0.85; }
        }

        .swar-wave-bar {
          animation: swar-wave 900ms ease-in-out infinite;
          transform-origin: center;
        }

        .swar-orbit {
          animation: swar-orbit 25s linear infinite;
        }

        .swar-pulse {
          animation: swar-pulse 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .swar-wave-bar,
          .swar-orbit,
          .swar-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-[#02030D]/85 p-0 backdrop-blur-xl sm:p-4 lg:p-6"
        onMouseDown={handleOverlayClick}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Performance details"
          className="relative flex h-full w-full max-w-7xl flex-col overflow-hidden border border-[#8B5CF6]/20 bg-[#07091A] shadow-[0_25px_100px_rgba(0,0,0,0.65)] sm:h-[min(92vh,900px)] sm:flex-row sm:rounded-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close post details"
            className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#08091D]/75 text-white/75 backdrop-blur-xl transition hover:border-[#A78BFA]/50 hover:bg-[#8B5CF6] hover:text-white"
          >
            <X size={19} />
          </button>

          {/* LEFT: Music experience */}
          <div className="relative flex min-h-[360px] w-full shrink-0 flex-col justify-between overflow-hidden bg-[#05051A] px-6 pb-6 pt-7 text-white sm:min-h-0 sm:w-[48%] sm:px-8 sm:py-8 lg:w-[50%]">
            {/* Background effects */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#8B5CF6]/20 blur-[110px]" />
              <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#00D4FF]/10 blur-[110px]" />

              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "radial-gradient(#ffffff 0.7px, transparent 0.7px)",
                  backgroundSize: "13px 13px",
                }}
              />

              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />
            </div>

            {/* Brand header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A78BFA]">
                  <AudioLines size={22} />
                </div>

                <div>
                  <p className="font-orbitron text-xs font-bold tracking-[0.2em] text-white">
                    PRATIVA
                  </p>
                  <p className="mt-1 text-[9px] tracking-[0.24em] text-[#A78BFA]/70">
                    SWAR MANCH
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-[#00D4FF]" />
                </span>
                <span className="text-[9px] font-semibold tracking-[0.18em] text-[#C4B5FD]">
                  NOW PLAYING
                </span>
              </div>
            </div>

            {/* Vinyl illustration */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6">
              <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64 lg:h-72 lg:w-72">
                <div className="swar-pulse absolute inset-0 rounded-full border border-[#8B5CF6]/30" />

                <div className="swar-orbit absolute inset-3 rounded-full border border-dashed border-[#A78BFA]/20" />

                <div className="absolute inset-7 rounded-full bg-[#8B5CF6]/20 blur-3xl" />

                <div className="relative flex h-[78%] w-[78%] items-center justify-center rounded-full border border-white/10 bg-[repeating-radial-gradient(circle_at_center,#28243C_0px,#28243C_2px,#151329_3px,#151329_5px)] shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
                  <div className="absolute inset-[12%] rounded-full border border-white/[0.08]" />
                  <div className="absolute inset-[24%] rounded-full border border-white/[0.08]" />
                  <div className="absolute inset-[36%] rounded-full border border-white/[0.08]" />

                  <div className="relative flex h-[35%] w-[35%] items-center justify-center overflow-hidden rounded-full border-4 border-[#262044] bg-gradient-to-br from-[#8B5CF6] to-[#31216E] shadow-[0_0_30px_rgba(139,92,246,0.35)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_55%)]" />
                    <Music2 size={32} className="relative text-white" />
                  </div>
                </div>

                <div className="absolute -right-1 top-8 flex h-11 w-11 items-center justify-center rounded-full border border-[#8B5CF6]/30 bg-[#11102D]/80 text-[#A78BFA] backdrop-blur-md">
                  <Headphones size={19} />
                </div>

                <div className="absolute -bottom-1 left-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#00D4FF]/20 bg-[#091A2C]/80 text-[#00D4FF] backdrop-blur-md">
                  <Radio size={17} />
                </div>
              </div>

              {/* Equalizer */}
              <div className="mt-8 flex h-10 items-center justify-center gap-[5px]">
                {Array.from({ length: 39 }).map((_, index) => {
                  const height = 9 + Math.abs(Math.sin(index * 0.7)) * 25;

                  return (
                    <span
                      key={index}
                      className="swar-wave-bar w-[3px] rounded-full bg-gradient-to-t from-[#6D28D9] via-[#8B5CF6] to-[#00D4FF]"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${(index % 9) * -110}ms`,
                        animationDuration: `${650 + (index % 5) * 150}ms`,
                      }}
                    />
                  );
                })}
              </div>

              <p className="mt-3 text-[9px] font-semibold tracking-[0.35em] text-[#A78BFA]/50">
                LISTEN. CREATE. CONNECT.
              </p>
            </div>

            {/* Track information */}
            <div className="relative z-10">
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A78BFA]">
                  <Disc3 size={14} />
                  <span>Featured performance</span>
                </div>

                <h2 className="max-w-full break-words font-orbitron text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {post?.title || "Untitled performance"}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  {authorName}
                  {post?.subCategory
                    ? ` · ${String(post.subCategory).replaceAll("-", " ")}`
                    : ""}
                </p>
              </div>

              {audioUrl ? (
                <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#0C0D27]/90 p-3 shadow-xl sm:p-4">
                  <SwarAudioPlayer key={audioUrl} src={audioUrl} />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-500">
                  Audio is currently unavailable.
                </div>
              )}

              <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <Heart size={14} className="text-[#A78BFA]" />
                  {formatCount(likesCount)} likes
                </span>

                <span className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-[#00D4FF]" />
                  {formatCount(commentsCount)} comments
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Community and conversation */}
          <div className="flex min-h-0 w-full flex-1 flex-col border-t border-white/[0.07] bg-[#08091D] sm:w-[52%] sm:border-l sm:border-t-0 lg:w-[50%]">
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-16 sm:px-7 sm:pt-8">
              {/* Creator */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleProfileClick(authorId)}
                  disabled={!authorId}
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#8B5CF6]/30 bg-[#171333] text-sm font-semibold text-[#C4B5FD] disabled:cursor-default"
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
                    className="block max-w-full truncate text-sm font-semibold text-white transition hover:text-[#A78BFA] disabled:cursor-default"
                  >
                    {authorName}
                  </button>

                  {authorUsername && (
                    <p className="truncate text-xs text-gray-500">
                      @{authorUsername}
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-xs text-gray-500">
                  {formatDate(post?.createdAt)}
                </span>
              </div>

              {/* Description */}
              {post?.description && (
                <div className="mt-7">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-300">
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
                      className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.08] px-3 py-1.5 text-xs text-[#C4B5FD]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Interaction bar */}
              <div className="mt-7 flex items-center justify-between border-y border-white/[0.08] py-4">
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
                        ? "text-[#FF4DB8]"
                        : "text-gray-400 hover:text-[#FF4DB8]"
                    }`}
                  >
                    {liking ? (
                      <LoaderCircle size={19} className="animate-spin" />
                    ) : (
                      <Heart size={19} fill={liked ? "currentColor" : "none"} />
                    )}
                    <span>{formatCount(likesCount)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => commentInputRef.current?.focus()}
                    className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#00D4FF]"
                  >
                    <MessageCircle size={19} />
                    <span>{formatCount(comments.length)}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  aria-label={
                    saved ? "Remove from saved posts" : "Save performance"
                  }
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    saved
                      ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#C4B5FD]"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-[#8B5CF6]/40 hover:text-[#A78BFA]"
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

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Conversation header */}
              <div className="mb-5 mt-7 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B5CF6]">
                    SWARGUNJ COMMUNITY
                  </p>

                  <h3 className="mt-1 font-orbitron text-lg font-bold text-white">
                    Conversation
                  </h3>
                </div>

                <span className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.08] px-3 py-1.5 text-xs text-[#C4B5FD]">
                  {comments.length} thoughts
                </span>
              </div>

              {/* Comments */}
              {loadingComments ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                  <LoaderCircle
                    size={17}
                    className="animate-spin text-[#A78BFA]"
                  />
                  Loading conversation...
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.035] px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 text-[#A78BFA]">
                    <MessageCircle size={21} />
                  </div>

                  <p className="font-orbitron text-sm font-semibold text-white">
                    Start the conversation.
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
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
                          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#171333] text-xs font-semibold text-[#C4B5FD] disabled:cursor-default"
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
                              className="text-sm font-semibold text-gray-200 transition hover:text-[#A78BFA] disabled:cursor-default"
                            >
                              {commentName}
                            </button>

                            {commentUsername && (
                              <span className="text-xs text-gray-600">
                                @{commentUsername}
                              </span>
                            )}

                            <span className="text-xs text-gray-600">
                              {formatDate(comment.createdAt)}
                            </span>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(commentId)}
                                disabled={deletingComment === commentId}
                                aria-label="Delete comment"
                                className="ml-auto flex items-center gap-1 text-xs text-gray-500 transition hover:text-red-400 disabled:opacity-50"
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

                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">
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
              className="flex shrink-0 items-center gap-3 border-t border-white/[0.08] bg-[#090A20] px-4 py-4 sm:px-7"
            >
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={1000}
                placeholder="Share what you felt..."
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#10112C] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#8B5CF6]/70 focus:ring-2 focus:ring-[#8B5CF6]/10"
              />

              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                aria-label="Send comment"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] transition hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
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
