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
        rounded-xl border border-[#F97316]/15 bg-[#1D140D]
        shadow-[0_8px_25px_rgba(0,0,0,0.18)]
        transition-all duration-300
        hover:-translate-y-1 hover:border-[#FB923C]/45
        hover:shadow-[0_14px_35px_rgba(249,115,22,0.10)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#F97316] focus-visible:ring-offset-2
        focus-visible:ring-offset-[#17100B]
      "
    >
      {/* TOP ORANGE ACCENT */}
      <div className="relative h-[3px] w-full overflow-hidden bg-[#F97316]/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
      </div>

      {/* CARD CONTENT */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
        {/* SUBTLE CARD GLOW */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#F97316]/[0.035] blur-[65px] transition-opacity duration-300 group-hover:bg-[#F97316]/[0.09]" />

        {/* CATEGORY */}
        <div className="relative mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#B9A18D]">
            <Feather size={14} strokeWidth={1.7} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
              Shabda Manch
            </span>
          </div>

          <ArrowUpRight
            size={17}
            strokeWidth={1.5}
            className="text-[#8F7A68] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FB923C]"
          />
        </div>

        {/* TITLE */}
        {title && (
          <h2 className="relative mb-4 text-[23px] font-semibold leading-tight tracking-[-0.025em] text-[#FFF3E8] transition-colors duration-300 group-hover:text-[#FDBA74] sm:text-[26px]">
            {title}
          </h2>
        )}

        {/* CONTENT PREVIEW */}
        {content && (
          <div
            className="
              relative mb-4 line-clamp-5 overflow-hidden
              whitespace-pre-wrap break-words
              text-[16px] leading-[1.9] text-[#E0CDBB]
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

        {/* DESCRIPTION */}
        {description && (
          <p className="relative mb-4 line-clamp-2 border-l-2 border-[#F97316]/60 pl-3 text-[12px] leading-relaxed text-[#B9A18D]">
            {description}
          </p>
        )}

        {/* READ FULL POST */}
        <div className="relative mt-auto flex items-center gap-2 pt-3 text-[#FB923C] transition-colors group-hover:text-[#FDBA74]">
          <BookOpen size={13} strokeWidth={1.8} />

          <span className="text-[11px] font-semibold tracking-wide">
            Read full post
          </span>

          <ArrowUpRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>

        {/* TAGS */}
        {tags.length > 0 && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-[#F97316]/20 bg-[#F97316]/[0.07] px-3 py-1 text-[10px] font-medium text-[#FDBA74] transition-colors group-hover:border-[#F97316]/30"
              >
                #{tag}
              </span>
            ))}

            {tags.length > 5 && (
              <span className="px-1 py-1 text-[10px] text-[#8F7A68]">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* AUTHOR AND ACTIONS */}
      <div className="border-t border-[#F97316]/10 bg-[#19110B] px-5 py-4 sm:px-6">
        {/* AUTHOR */}
        <button
          type="button"
          onClick={handleAuthorClick}
          className="flex w-full min-w-0 items-center gap-3 text-left"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={authorName}
              className="h-9 w-9 shrink-0 rounded-full border border-[#F97316]/25 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F97316]/25 bg-[#382215] text-xs font-semibold text-[#FDBA74]">
              {getInitials(authorName)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-[#FFF3E8] transition-colors hover:text-[#FB923C]">
              {authorName}
            </p>

            <div className="flex items-center gap-2">
              {username && (
                <span className="truncate text-[10px] text-[#A9917C]">
                  @{username}
                </span>
              )}

              {formatDate(post.createdAt) && (
                <>
                  {username && (
                    <span className="text-[9px] text-[#6F5A48]">·</span>
                  )}

                  <span className="shrink-0 text-[10px] text-[#A9917C]">
                    {formatDate(post.createdAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* ACTIONS */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F97316]/10 pt-3">
          <div className="flex items-center gap-5">
            {/* LIKE */}
            <button
              type="button"
              onClick={(event) => handleAction(event, onLike)}
              aria-label={isLiked ? "Unlike post" : "Like post"}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked
                  ? "text-[#FB923C]"
                  : "text-[#A9917C] hover:text-[#FB923C]"
              }`}
            >
              <Heart
                size={17}
                strokeWidth={1.7}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span>{likesCount}</span>
            </button>

            {/* COMMENTS */}
            <button
              type="button"
              onClick={(event) => handleAction(event, onComment)}
              aria-label="View comments"
              className="flex items-center gap-1.5 text-xs text-[#A9917C] transition-colors hover:text-[#FB923C]"
            >
              <MessageCircle size={17} strokeWidth={1.7} />
              <span>{commentsCount}</span>
            </button>
          </div>

          {/* BOOKMARK */}
          <button
            type="button"
            onClick={(event) => handleAction(event, onSave)}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark post"}
            className={`transition-colors ${
              isSaved ? "text-[#FB923C]" : "text-[#A9917C] hover:text-[#FB923C]"
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
