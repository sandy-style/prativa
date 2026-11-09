import React, { useState } from "react";
import DrishyaPost from "./DrishyaPost";
import DrishyaPostDetail from "./DrishyaPostDetail";

const DrishyaGrid = ({
  posts = [],
  loading = false,
  onLike,
  onComment,
  currentUserId,
}) => {
  const [selectedPost, setSelectedPost] = useState(null);

  // Loading skeleton
  if (loading) {
    return (
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="mb-5 break-inside-avoid animate-pulse overflow-hidden rounded-xl border border-[#173047] bg-[#071525]"
          >
            {/* Author skeleton */}
            <div className="flex h-16 items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-[#142B40]" />

              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[#142B40]" />
                <div className="h-2 w-16 rounded bg-[#102438]" />
              </div>
            </div>

            {/* Photograph skeleton */}
            <div
              className={`bg-[#102438] ${
                item % 3 === 0
                  ? "h-[360px]"
                  : item % 2 === 0
                    ? "h-[280px]"
                    : "h-[420px]"
              }`}
            />

            {/* Caption skeleton */}
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 rounded bg-[#142B40]" />
              <div className="h-3 w-full rounded bg-[#102438]" />
              <div className="h-3 w-1/2 rounded bg-[#102438]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {!posts.length ? (
        // Empty gallery
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#173047] bg-[#071525] px-6 py-24 text-center">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D4FF]/[0.05] blur-[90px]" />

          {/* Camera icon */}
          <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#00D4FF]/25 bg-[#00D4FF]/[0.06]">
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D4FF"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 4h-4l-2 3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-3Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </div>

          <p className="relative mb-3 font-serif text-3xl text-white">
            Nothing here just yet.
          </p>

          <p className="relative max-w-sm text-sm leading-7 text-slate-400">
            Every great photograph begins with someone willing to share their
            perspective. The next photograph could be yours.
          </p>

          <div className="relative mt-7 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#00D4FF]/70">
            <span className="h-px w-7 bg-[#00D4FF]/40" />
            Your perspective matters
            <span className="h-px w-7 bg-[#00D4FF]/40" />
          </div>
        </div>
      ) : (
        // Pinterest-style masonry gallery
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {posts.map((post) => (
            <DrishyaPost
              key={post._id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onOpen={setSelectedPost}
            />
          ))}
        </div>
      )}

      {/* Photograph detail modal */}
      {selectedPost && (
        <DrishyaPostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={(updatedPost) => {
            setSelectedPost(updatedPost);
          }}
          onLike={onLike}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

export default DrishyaGrid;
