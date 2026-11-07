import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Feather,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

const getAuthor = (post) => {
  return post?.authorProfile || post?.author || {};
};

const getAuthorName = (post) => {
  const author = getAuthor(post);
  return author?.name || post?.authorName || "Anonymous";
};

const getUsername = (post) => {
  const author = getAuthor(post);
  return author?.username || post?.username || "";
};

const getAuthorId = (post) => {
  const author = getAuthor(post);

  if (typeof author === "string") return author;

  return author?._id || author?.id || null;
};

const getProfileImage = (post) => {
  const author = getAuthor(post);
  return author?.profileImage || post?.profileImage || "";
};

const getInitials = (name) => {
  if (!name) return "A";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
};

const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year:
      parsed.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

const FONT_STYLES = {
  serif: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
  },
  sans: {
    fontFamily: '"Plus Jakarta Sans", Arial, sans-serif',
  },
  devanagari: {
    fontFamily: '"Noto Serif Devanagari", serif',
  },
  handwritten: {
    fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
  },
};

const ShabdaPost = ({
  post,
  onClick,
  onLike,
  onComment,
  onSave,
  onAuthorClick,
}) => {
  const navigate = useNavigate();

  if (!post) return null;

  const authorName = getAuthorName(post);
  const username = getUsername(post);
  const profileImage = getProfileImage(post);
  const authorId = getAuthorId(post);

  const title = post.title || "";
  const content = post.content || "";
  const description = post.description || "";
  const tags = Array.isArray(post.tags) ? post.tags : [];

  const likesCount = Number(post.likesCount ?? post.likes?.length ?? 0);
  const commentsCount = Number(
    post.commentsCount ?? post.comments?.length ?? 0,
  );

  const isLiked = Boolean(post.isLiked);
  const isSaved = Boolean(post.isSaved);

  const font = FONT_STYLES[post.fontStyle] || FONT_STYLES.serif;

  const textAlign = ["left", "center", "right"].includes(post.textAlign)
    ? post.textAlign
    : "left";

  const handleCardClick = () => {
    onClick?.(post);
  };

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleAction = (event, callback) => {
    event.preventDefault();
    event.stopPropagation();
    callback?.(post);
  };

  const handleAuthorClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onAuthorClick) {
      onAuthorClick(post);
      return;
    }

    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Read ${title || "written work"} by ${authorName}`}
      className="
        group relative flex h-full cursor-pointer flex-col overflow-hidden
        rounded-2xl border border-[#eae6e0] bg-white
        transition-all duration-300
        hover:-translate-y-1 hover:border-[#f0b8c2]
        hover:shadow-[0_16px_40px_rgba(70,35,40,0.08)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#E5092D] focus-visible:ring-offset-2
      "
    >
      {/* Top accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#E5092D]/20 via-[#E5092D] to-[#E5092D]/20 opacity-70 transition-opacity group-hover:opacity-100" />

      {/* Post content */}
      <div className="flex flex-1 flex-col px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
        {/* Category */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#99918B]">
            <Feather size={14} strokeWidth={1.6} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
              ShabdaManch
            </span>
          </div>

          <ArrowUpRight
            size={17}
            strokeWidth={1.5}
            className="text-[#B7AFA8] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#E5092D]"
          />
        </div>

        {/* Title */}
        {title && (
          <h2 className="mb-4 text-[24px] font-semibold leading-tight tracking-[-0.025em] text-[#292424] sm:text-[27px]">
            {title}
          </h2>
        )}

        {/* Short content preview */}
        {content && (
          <div
            className="
              mb-4 line-clamp-5 overflow-hidden
              whitespace-pre-wrap break-words
              text-[16px] leading-[1.9] text-[#625C58]
            "
            style={{
              fontFamily: font.fontFamily,
              textAlign,
              overflowWrap: "anywhere",
            }}
          >
            {content}
          </div>
        )}

        {/* Description preview */}
        {description && (
          <p className="mb-4 line-clamp-2 border-l-2 border-[#E5092D]/30 pl-3 text-[12px] leading-relaxed text-[#99918B]">
            {description}
          </p>
        )}

        {/* Read full post */}
        <div className="mt-auto flex items-center gap-2 pt-2 text-[#E5092D] transition-colors group-hover:text-[#C90024]">
          <BookOpen size={13} strokeWidth={1.8} />

          <span className="text-[11px] font-semibold tracking-wide">
            Read full post
          </span>

          <ArrowUpRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full bg-[#FCEAED] px-3 py-1 text-[10px] font-medium text-[#B83249]"
              >
                #{tag}
              </span>
            ))}

            {tags.length > 5 && (
              <span className="px-1 py-1 text-[10px] text-[#99918B]">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Author and actions */}
      <div className="border-t border-[#F0ECE7] px-6 py-4 sm:px-7">
        {/* Author */}
        <button
          type="button"
          onClick={handleAuthorClick}
          className="flex w-full min-w-0 items-center gap-3 text-left"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={authorName}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCEAED] text-xs font-semibold text-[#E5092D]">
              {getInitials(authorName)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-[#34302E]">
              {authorName}
            </p>

            <div className="flex items-center gap-2">
              {username && (
                <span className="truncate text-[10px] text-[#99918B]">
                  @{username}
                </span>
              )}

              {formatDate(post.createdAt) && (
                <>
                  {username && (
                    <span className="text-[9px] text-[#B7AFA8]">·</span>
                  )}

                  <span className="shrink-0 text-[10px] text-[#99918B]">
                    {formatDate(post.createdAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F0ECE7] pt-3">
          <div className="flex items-center gap-5">
            {/* Like */}
            <button
              type="button"
              onClick={(event) => handleAction(event, onLike)}
              aria-label={isLiked ? "Unlike post" : "Like post"}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked
                  ? "text-[#E5092D]"
                  : "text-[#99918B] hover:text-[#E5092D]"
              }`}
            >
              <Heart
                size={17}
                strokeWidth={1.7}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likesCount}</span>
            </button>

            {/* Comments */}
            <button
              type="button"
              onClick={(event) => handleAction(event, onComment)}
              aria-label="View comments"
              className="flex items-center gap-1.5 text-xs text-[#99918B] transition-colors hover:text-[#E5092D]"
            >
              <MessageCircle size={17} strokeWidth={1.7} />
              <span>{commentsCount}</span>
            </button>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={(event) => handleAction(event, onSave)}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark post"}
            className={`transition-colors ${
              isSaved ? "text-[#E5092D]" : "text-[#99918B] hover:text-[#E5092D]"
            }`}
          >
            <Bookmark
              size={17}
              strokeWidth={1.7}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ShabdaPost;
