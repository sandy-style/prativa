import React from "react";

const DrishyaPost = ({ post, onOpen }) => {
  if (!post) return null;

  const image = post.media?.url || post.image || "";

  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-xl border border-[#173047] bg-[#071525] transition-all duration-300 hover:border-[#00D4FF]/50 hover:shadow-[0_8px_30px_rgba(0,212,255,0.08)]">
      <button
        type="button"
        onClick={() => onOpen?.(post)}
        className="relative block w-full overflow-hidden bg-[#102438] text-left"
        aria-label={`Open photograph: ${post.title || "Photography"}`}
      >
        {image ? (
          <img
            src={image}
            alt={post.title || "Photography"}
            loading="lazy"
            className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-sm text-slate-500">
            Photograph unavailable
          </div>
        )}

        {/* Subtle hover overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030A17]/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Focus corner accents */}
        <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-[#00D4FF]/0 transition-all duration-300 group-hover:border-[#00D4FF]/80" />

        <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-[#00D4FF]/0 transition-all duration-300 group-hover:border-[#00D4FF]/80" />
      </button>
    </article>
  );
};

export default DrishyaPost;
