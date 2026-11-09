import React from "react";
import {
  Feather,
  BookOpen,
  LoaderCircle,
  PenLine,
  Sparkles,
} from "lucide-react";

import ShabdaPost from "./ShabdaPost";

const ShabdaFeed = ({
  posts = [],
  loading = false,
  onPostSelect,
  onLike,
  onComment,
  onSave,
  onAuthorClick,
}) => {
  const validPosts = Array.isArray(posts)
    ? posts.filter(
        (post) =>
          post &&
          post._id &&
          post.category === "words" &&
          typeof post.content === "string",
      )
    : [];

  const skeletons = [1, 2, 3, 4, 5, 6];

  // ==========================================
  // INITIAL LOADING SKELETON
  // ==========================================

  if (loading && validPosts.length === 0) {
    return (
      <section className="w-full">
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skeletons.map((item) => (
            <div
              key={item}
              className="group relative overflow-hidden rounded-xl border border-[#F97316]/15 bg-[#1D140D] shadow-[0_8px_30px_rgba(0,0,0,0.16)]"
            >
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#F97316]/60 to-transparent" />

              <div className="p-5 sm:p-6">
                <div className="mb-7 flex items-center justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#392719]" />
                  <div className="h-4 w-4 animate-pulse rounded bg-[#392719]" />
                </div>

                <div className="mb-5 h-6 w-3/4 animate-pulse rounded bg-[#392719]" />

                <div className="space-y-3">
                  <div className="h-3 w-full animate-pulse rounded bg-[#392719]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#392719]" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#392719]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#392719]" />
                </div>

                <div className="mt-8 h-3 w-28 animate-pulse rounded bg-[#6B3218]/40" />

                <div className="mt-7 border-t border-[#F97316]/10 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-[#392719]" />

                    <div className="space-y-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-[#392719]" />
                      <div className="h-2 w-16 animate-pulse rounded bg-[#392719]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (validPosts.length === 0) {
    return (
      <section className="relative flex min-h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#F97316]/10 bg-[#1D140D]/70 px-5 py-16 text-center">
        {/* BACKGROUND GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F97316]/[0.07] blur-[90px]" />

        <div className="relative z-10">
          <div className="relative mx-auto mb-6 w-fit">
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#F97316]/30 bg-[#2A1B11] text-[#FB923C] shadow-[0_0_35px_rgba(249,115,22,0.12)]">
              <BookOpen size={30} strokeWidth={1.4} />
            </div>

            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#1D140D] bg-[#F97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Sparkles size={13} />
            </span>
          </div>

          <span className="mb-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FB923C]">
            <Feather size={13} />
            Shabda Manch
          </span>

          <h2 className="font-[Orbitron] text-xl font-semibold tracking-tight text-[#FFF3E8] sm:text-2xl">
            A page waiting to be written.
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#B9A18D]">
            Poetry, stories, thoughts, and little pieces of imagination belong
            here. Be the first to share yours.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#FB923C]">
            <PenLine size={15} />
            <span>Every word has a place.</span>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // FEED
  // ==========================================

  return (
    <section className="w-full">
      {/* REFRESH INDICATOR */}
      {loading && (
        <div className="mb-5 flex items-center justify-center gap-2 text-xs text-[#B9A18D]">
          <LoaderCircle size={14} className="animate-spin text-[#FB923C]" />
          Refreshing collection...
        </div>
      )}

      {/* POSTS GRID */}
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {validPosts.map((post) => (
          <ShabdaPost
            key={post._id}
            post={post}
            onClick={onPostSelect}
            onLike={onLike}
            onComment={onComment}
            onSave={onSave}
            onAuthorClick={onAuthorClick}
          />
        ))}
      </div>
    </section>
  );
};

export default ShabdaFeed;
