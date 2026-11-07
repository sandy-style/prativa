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

  // Initial loading skeleton
  if (loading && validPosts.length === 0) {
    return (
      <section className="w-full">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-[#F0ECE7]" />
            <div className="mt-3 h-7 w-44 animate-pulse rounded bg-[#F0ECE7]" />
          </div>

          <div className="h-8 w-8 animate-pulse rounded-full bg-[#F0ECE7]" />
        </div>

        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {skeletons.map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-[#EAE6E0] bg-white"
            >
              <div className="h-[3px] bg-[#F0ECE7]" />

              <div className="p-6 sm:p-7">
                <div className="mb-7 flex items-center justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#F0ECE7]" />
                  <div className="h-4 w-4 animate-pulse rounded bg-[#F0ECE7]" />
                </div>

                <div className="mb-5 h-6 w-3/4 animate-pulse rounded bg-[#F0ECE7]" />

                <div className="space-y-3">
                  <div className="h-3 w-full animate-pulse rounded bg-[#F0ECE7]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#F0ECE7]" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#F0ECE7]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#F0ECE7]" />
                </div>

                <div className="mt-8 h-3 w-28 animate-pulse rounded bg-[#FCEAED]" />

                <div className="mt-8 border-t border-[#F0ECE7] pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-[#F0ECE7]" />

                    <div className="space-y-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-[#F0ECE7]" />
                      <div className="h-2 w-16 animate-pulse rounded bg-[#F0ECE7]" />
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

  // Empty state
  if (validPosts.length === 0) {
    return (
      <section className="flex min-h-[380px] w-full flex-col items-center justify-center px-5 py-16 text-center">
        <div className="relative mb-6">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#FCEAED] text-[#E5092D]">
            <BookOpen size={30} strokeWidth={1.4} />
          </div>

          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#F8F7F4] bg-white text-[#E5092D]">
            <Sparkles size={13} />
          </span>
        </div>

        <span className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E5092D]">
          <Feather size={13} />
          ShabdaManch
        </span>

        <h2 className="text-2xl font-semibold tracking-tight text-[#292424] sm:text-3xl">
          A page waiting to be written.
        </h2>

        <p className="mt-3 max-w-sm text-sm leading-7 text-[#89817C]">
          Poetry, stories, thoughts, and little pieces of imagination belong
          here. Be the first to share yours.
        </p>

        <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#E5092D]">
          <PenLine size={15} />
          <span>Every word has a place.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* Feed heading */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#E5092D]">
            <Feather size={14} strokeWidth={1.7} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
              The written collection
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-[#292424] sm:text-2xl">
            Words worth sharing
          </h2>

          <p className="mt-1 text-xs text-[#99918B]">
            Stories, poetry, and thoughts from the community.
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-[#F0DDE0] bg-white px-3 py-1.5 text-[11px] font-medium text-[#B83249]">
          {validPosts.length} {validPosts.length === 1 ? "piece" : "pieces"}
        </span>
      </div>

      {/* Refresh indicator */}
      {loading && (
        <div className="mb-5 flex items-center justify-center gap-2 text-xs text-[#99918B]">
          <LoaderCircle size={14} className="animate-spin text-[#E5092D]" />
          Refreshing collection...
        </div>
      )}

      {/* Posts grid */}
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
