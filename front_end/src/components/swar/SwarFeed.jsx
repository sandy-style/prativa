import React from "react";
import { LoaderCircle, Music2, AudioLines, Headphones } from "lucide-react";

import SwarPostCard from "./SwarPostCard";

const SwarFeed = ({
  posts = [],
  loading = false,
  onPostSelect,
  onLike,
  onComment,
  onSave,
}) => {
  const validPosts = Array.isArray(posts)
    ? posts.filter((post) => post && post._id)
    : [];

  // Loading skeleton
  if (loading && validPosts.length === 0) {
    return (
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Loading performances"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-[#8B5CF6]/15 bg-[#08081D] p-5"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#17152E]" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-[#17152E]" />
                <div className="h-2 w-20 rounded bg-[#17152E]" />
              </div>
            </div>

            <div className="mb-4 flex h-28 items-center justify-center rounded-xl border border-[#8B5CF6]/10 bg-[#0D0B25]">
              <AudioLines size={30} className="text-[#8B5CF6]/40" />
            </div>

            <div className="mb-3 h-3 w-3/4 rounded bg-[#17152E]" />
            <div className="h-2 w-1/2 rounded bg-[#17152E]" />

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <div className="h-3 w-24 rounded bg-[#17152E]" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Empty state
  if (validPosts.length === 0) {
    return (
      <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#8B5CF6]/15 bg-[#08081D] px-6 py-14 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.06] blur-[90px]" />

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.08] text-[#A78BFA]">
            <Music2 size={29} strokeWidth={1.6} />
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A78BFA]">
            The stage is yours
          </p>

          <h3 className="font-orbitron text-xl font-bold tracking-wide text-white sm:text-2xl">
            NO PERFORMANCES YET
          </h3>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
            Every melody begins somewhere. Be the first to share your voice,
            music, and original performances with the Swar community.
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs tracking-wider text-[#A78BFA]/60">
            <Headphones size={15} />
            <span>YOUR SOUND. YOUR STAGE.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full" aria-label="Performances">
      {/* Updating indicator */}
      {loading && (
        <div
          className="mb-5 flex items-center justify-center gap-2 text-xs tracking-wide text-white/40"
          role="status"
        >
          <LoaderCircle size={15} className="animate-spin text-[#A78BFA]" />
          Updating performances...
        </div>
      )}

      {/* Performance grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {validPosts.map((post) => (
          <SwarPostCard
            key={post._id}
            post={post}
            onClick={() => onPostSelect?.(post)}
            onLike={() => onLike?.(post)}
            onComment={() => onComment?.(post)}
            onSave={() => onSave?.(post)}
          />
        ))}
      </div>
    </section>
  );
};

export default SwarFeed;
