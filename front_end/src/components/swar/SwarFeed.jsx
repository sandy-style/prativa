import React from "react";
import { LoaderCircle, Music2, AudioLines } from "lucide-react";

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
      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Loading performances"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-[#EAE6E0] bg-white p-5"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#F0EDE8]" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-[#F0EDE8]" />
                <div className="h-2 w-20 rounded bg-[#F0EDE8]" />
              </div>
            </div>

            <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-[#F8F7F4]">
              <AudioLines size={30} className="text-[#DDD6CF]" />
            </div>

            <div className="mb-3 h-3 w-3/4 rounded bg-[#F0EDE8]" />
            <div className="h-2 w-1/2 rounded bg-[#F0EDE8]" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (validPosts.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#EAE6E0] bg-white px-6 py-14 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5092D]/[0.07] text-[#E5092D]">
          <Music2 size={28} strokeWidth={1.7} />
        </div>

        <h3 className="font-serif text-2xl font-medium text-[#202020]">
          No performances yet
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[#88817B]">
          The stage is waiting. Be among the first creators to share your voice,
          music, and original performances.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full" aria-label="Performances">
      {/* Updating indicator */}
      {loading && (
        <div
          className="mb-5 flex items-center justify-center gap-2 text-sm text-[#88817B]"
          role="status"
        >
          <LoaderCircle size={16} className="animate-spin text-[#E5092D]" />
          Updating performances...
        </div>
      )}

      {/* Performance grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
