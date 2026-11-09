import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Music2,
  Play,
  Pause,
  AudioLines,
} from "lucide-react";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png";

// Safely extract a user ID.
const getUserId = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;

  return user._id || user.id || null;
};

// Extract audio URL.
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

// Extract artwork URL.
const getArtworkUrl = (post) => {
  if (!post) return null;

  const artwork =
    post.coverImage ||
    post.thumbnail ||
    post.artwork ||
    post.image ||
    post.media?.thumbnail ||
    post.media?.coverImage;

  if (typeof artwork === "string") return artwork;
  if (typeof artwork?.url === "string") return artwork.url;

  return null;
};

// Format engagement counts.
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

// Format audio duration.
const formatDuration = (value) => {
  if (typeof value === "string" && value.includes(":")) {
    return value;
  }

  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds <= 0) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const SwarPostCard = ({ post, onClick, onLike, onComment, onSave }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  if (!post) return null;

  const audioUrl = getAudioUrl(post);
  const artworkUrl = getArtworkUrl(post);

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

  const likesCount = Number(post.likesCount ?? post.likes?.length ?? 0);

  const commentsCount = Number(
    post.commentsCount ?? post.comments?.length ?? 0,
  );

  const playsCount = Number(
    post.playsCount ?? post.playCount ?? post.plays ?? post.viewsCount ?? 0,
  );

  const duration = formatDuration(
    post.duration || post.audioDuration || post.metadata?.duration,
  );

  // Reset artwork fallback when artwork changes.
  useEffect(() => {
    setImageError(false);
  }, [artworkUrl]);

  // Reset audio state when audio changes.
  useEffect(() => {
    setIsPlaying(false);
    setAudioError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  // Navigate to creator profile.
  const openProfile = (event) => {
    event.stopPropagation();

    if (creatorId) {
      navigate(`/profile/${creatorId}`);
    }
  };

  // Open post details.
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

  // Play / pause audio.
  const togglePlayback = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const audio = audioRef.current;

    if (!audio || !audioUrl || audioError) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setAudioError(true);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setAudioError(true);
  };

  return (
    <article
      onClick={openPost}
      onKeyDown={handleCardKeyDown}
      tabIndex={onClick ? 0 : undefined}
      aria-label={
        onClick
          ? `Open ${post.title || "performance"} by ${creatorName}`
          : undefined
      }
      className={`group relative isolate aspect-[1.18/1] min-h-[245px] w-full overflow-hidden rounded-2xl border border-[#8B5CF6]/25 bg-[#08091D] transition-all duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/70 hover:shadow-[0_12px_35px_rgba(91,33,182,0.18)] ${
        onClick
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
          : ""
      }`}
    >
      {/* Artwork */}
      {artworkUrl && !imageError ? (
        <img
          src={artworkUrl}
          alt=""
          onError={() => setImageError(true)}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#171044] via-[#10102C] to-[#030817]">
          <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[#00D4FF]/10 blur-3xl" />

          <div className="absolute inset-0 flex items-center justify-center text-[#A78BFA]/30">
            <AudioLines size={100} strokeWidth={0.8} />
          </div>

          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/20 p-3 text-[#A78BFA]/60">
            <Music2 size={22} />
          </div>
        </div>
      )}

      {/* Cinematic gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030817]/25 via-transparent to-[#030817]/95" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#030817]/25 via-transparent to-transparent" />

      {/* Top section */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <span className="max-w-[70%] truncate rounded-full border border-white/10 bg-[#05051A]/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#DDD0FF] opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
          {post.categoryLabel || post.category || "Music"}
        </span>

        {/* Play button */}
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!audioUrl || audioError}
          aria-label={isPlaying ? "Pause performance" : "Play performance"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C4B5FD]/70 bg-[#08081D]/65 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#C4B5FD] hover:bg-[#8B5CF6] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? (
            <Pause size={19} fill="currentColor" />
          ) : (
            <Play size={19} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="none"
          onEnded={handleAudioEnded}
          onError={handleAudioError}
        />
      )}

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {/* Creator */}
        <div className="mb-3 min-w-0">
          <h3 className="truncate text-lg font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-xl">
            {post.title || "Untitled performance"}
          </h3>

          <button
            type="button"
            onClick={openProfile}
            disabled={!creatorId}
            className="mt-1 block max-w-full truncate text-left text-sm text-white/75 transition hover:text-[#C4B5FD] disabled:cursor-default"
          >
            by {creatorName}
          </button>
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Plays */}
            <div
              className="flex items-center gap-1.5 text-xs text-white/80"
              title="Plays"
            >
              <Play size={16} className="text-[#C4B5FD]" fill="currentColor" />
              <span>{formatCount(playsCount)}</span>
            </div>

            {/* Likes */}
            <button
              type="button"
              onClick={(event) => handleAction(event, onLike)}
              aria-label={isLiked ? "Unlike performance" : "Like performance"}
              aria-pressed={isLiked}
              className={`flex items-center gap-1.5 text-xs transition ${
                isLiked
                  ? "text-[#FF4DB8]"
                  : "text-white/80 hover:text-[#FF4DB8]"
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>{formatCount(likesCount)}</span>
            </button>

            {/* Comments */}
            <button
              type="button"
              onClick={(event) => handleAction(event, onComment)}
              aria-label="View comments"
              className="flex items-center gap-1.5 text-xs text-white/75 transition hover:text-[#C4B5FD]"
            >
              <MessageCircle size={17} />
              <span>{formatCount(commentsCount)}</span>
            </button>
          </div>

          {/* Duration */}
          {duration && (
            <span className="shrink-0 rounded-full border border-[#A78BFA]/40 bg-[#08081D]/70 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
              {duration}
            </span>
          )}

          {/* Bookmark */}
          {onSave && (
            <button
              type="button"
              onClick={(event) => handleAction(event, onSave)}
              aria-label={
                isSaved ? "Remove saved performance" : "Save performance"
              }
              aria-pressed={isSaved}
              className={`rounded-full p-1.5 transition ${
                isSaved
                  ? "text-[#A78BFA]"
                  : "text-white/70 hover:text-[#A78BFA]"
              }`}
            >
              <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute bottom-[76px] right-4 flex items-end gap-[3px]">
          {[1, 2, 3, 4, 5].map((bar) => (
            <span
              key={bar}
              className="w-[3px] animate-pulse rounded-full bg-[#A78BFA]"
              style={{
                height: `${8 + (bar % 3) * 5}px`,
                animationDelay: `${bar * 100}ms`,
              }}
            />
          ))}
        </div>
      )}
    </article>
  );
};

export default SwarPostCard;
