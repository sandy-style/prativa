import React from "react";
import { Heart, MessageCircle } from "lucide-react";

const RangPost = ({ post, onOpen }) => {
  if (!post) return null;

  const image = post.media?.url || post.image || "";

  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-xl border border-[#8A2BE2]/30 bg-[#070F2B] transition-all duration-300 hover:border-[#FF4DB8]/60 hover:shadow-[0_8px_30px_rgba(255,77,184,0.15)]">
      <button
        type="button"
        onClick={() => onOpen?.(post)}
        className="relative block w-full overflow-hidden bg-[#0A1640] text-left"
        aria-label={`Open artwork: ${post.title || "Artwork"}`}
      >
        {image ? (
          <img
            src={image}
            alt={post.title || "Artwork"}
            loading="lazy"
            className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-sm text-slate-500">
            Artwork unavailable
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050A30]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-xs font-semibold text-white truncate">{post.title || "Untitled Artwork"}</p>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-300">
            <span>@{post.authorProfile?.username || post.author?.name || "artist"}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart size={12} className="text-[#FF4DB8]" />
                {post.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} className="text-[#8A2BE2]" />
                {post.commentsCount || 0}
              </span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
};

export default RangPost;
