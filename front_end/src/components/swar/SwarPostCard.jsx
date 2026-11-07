import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Music2 } from "lucide-react";

import SwarAudioPlayer from "./SwarAudioPlayer";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png";

// Safely extract a user ID from populated or unpopulated references.
const getUserId = (user) => {
  if (!user) return null;

  if (typeof user === "string") return user;

  return user._id || user.id || null;
};

// Safely extract the audio URL.
const getAudioUrl = (post) => {
  if (!post) return null;

  const media = post.media;
  const audio = post.audio;

  if (typeof media === "string") return media;
  if (typeof media?.url === "string") return media.url;

  if (typeof audio === "string") return audio;
  if (typeof audio?.url === "string") return audio.url;

  return post.audioUrl || post.mediaUrl || null;
};

// Safely format the post date.
const formatDate = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
};

// Safely format engagement counts.
const getCount = (value) => {
  const count = Number(value);

  return Number.isFinite(count) && count >= 0 ? count : 0;
};

const SwarPostCard = ({ post, onClick, onLike, onComment, onSave }) => {
  const navigate = useNavigate();

  const [imageError, setImageError] = useState(false);

  if (!post) return null;

  const audioUrl = getAudioUrl(post);

  // Creator information.
  const author =
    post.author && typeof post.author === "object" ? post.author : {};

  const creator =
    post.authorProfile && typeof post.authorProfile === "object"
      ? post.authorProfile
      : {};

  const creatorName =
    creator.name || author.name || post.authorName || "Unknown creator";

  const username = creator.username || author.username || "creator";

  const profileImage =
    creator.profileImage || author.profileImage || DEFAULT_AVATAR;

  const creatorId =
    getUserId(post.author) || getUserId(creator.user) || getUserId(post.user);

  // Engagement information.
  const isLiked = Boolean(post.isLiked);
  const isSaved = Boolean(post.isSaved);

  const likesCount = getCount(post.likesCount ?? post.likes?.length);

  const commentsCount = getCount(post.commentsCount ?? post.comments?.length);

  const formattedDate = formatDate(post.createdAt);

  // Reset image fallback when the profile image changes.
  useEffect(() => {
    setImageError(false);
  }, [profileImage]);

  // Navigate to creator profile.
  const openProfile = (event) => {
    event.stopPropagation();

    if (creatorId) {
      navigate(`/profile/${creatorId}`);
    }
  };

  // Open the post detail component.
  const openPost = () => {
    onClick?.(post);
  };

  // Keyboard accessibility.
  const handleCardKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPost();
    }
  };

  // Prevent nested actions from opening post details.
  const handleAction = (event, callback) => {
    event.preventDefault();
    event.stopPropagation();

    callback?.(post);
  };

  return (
    <article
      onClick={openPost}
      onKeyDown={handleCardKeyDown}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open post by ${creatorName}` : undefined}
      className={`group w-full overflow-hidden rounded-2xl border border-[#EAE6E0] bg-white p-5 transition-all duration-300 hover:shadow-md ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5092D]"
          : ""
      }`}
    >
      {/* Creator information */}
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={openProfile}
          disabled={!creatorId}
          aria-label={`View ${creatorName}'s profile`}
          className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F8F7F4] disabled:cursor-default"
        >
          <img
            src={imageError ? DEFAULT_AVATAR : profileImage}
            alt=""
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openProfile}
            disabled={!creatorId}
            className="block max-w-full truncate text-left text-sm font-semibold text-[#202020] transition hover:text-[#E5092D] disabled:cursor-default"
          >
            {creatorName}
          </button>

          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#99918B]">
            <span className="truncate">@{username}</span>

            {formattedDate && (
              <>
                <span>·</span>
                <time dateTime={post.createdAt}>{formattedDate}</time>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Audio performance */}
      <div
        className="mb-4 rounded-xl border border-[#EAE6E0] bg-[#F8F7F4] p-4"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5092D]/[0.08] text-[#E5092D]">
            <Music2 size={22} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-[#202020]">
              {post.title || "Untitled performance"}
            </h3>

            <p className="mt-1 text-xs text-[#99918B]">
              {post.categoryLabel || post.category || "Audio performance"}
            </p>
          </div>
        </div>

        {audioUrl ? (
          <SwarAudioPlayer key={audioUrl} src={audioUrl} compact />
        ) : (
          <p className="text-xs text-[#99918B]">
            Audio is currently unavailable.
          </p>
        )}
      </div>

      {/* Caption / Description */}
      {(post.description || post.content) && (
        <p className="mb-5 whitespace-pre-wrap break-words text-sm leading-6 text-[#66615D]">
          {post.description || post.content}
        </p>
      )}

      {/* Post actions */}
      <div className="flex items-center justify-between border-t border-[#EAE6E0] pt-4">
        <div className="flex items-center gap-5">
          {/* Like */}
          <button
            type="button"
            onClick={(event) => handleAction(event, onLike)}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            aria-pressed={isLiked}
            className={`flex items-center gap-1.5 text-sm transition ${
              isLiked ? "text-[#E5092D]" : "text-[#99918B] hover:text-[#E5092D]"
            }`}
          >
            <Heart size={19} fill={isLiked ? "currentColor" : "none"} />

            <span>{likesCount}</span>
          </button>

          {/* Comments */}
          <button
            type="button"
            onClick={(event) => handleAction(event, onComment)}
            aria-label="View comments"
            className="flex items-center gap-1.5 text-sm text-[#99918B] transition hover:text-[#E5092D]"
          >
            <MessageCircle size={19} />
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={(event) => handleAction(event, onSave)}
          aria-label={isSaved ? "Remove saved post" : "Save post"}
          aria-pressed={isSaved}
          className={`rounded-full p-2 transition ${
            isSaved ? "text-[#E5092D]" : "text-[#99918B] hover:text-[#E5092D]"
          }`}
        >
          <Bookmark size={19} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
};

export default SwarPostCard;
