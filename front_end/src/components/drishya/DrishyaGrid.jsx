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

    if (loading) {
      return (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="mb-5 break-inside-avoid animate-pulse overflow-hidden rounded-xl border border-[#EAE6E0] bg-white"
            >
              <div className="flex h-16 items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-[#EFEBE5]" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[#EFEBE5]" />
                  <div className="h-2 w-16 rounded bg-[#EFEBE5]" />
                </div>
              </div>
              <div
                className={`bg-[#EFEBE5] ${
                  item % 3 === 0
                    ? "h-[360px]"
                    : item % 2 === 0
                      ? "h-[280px]"
                      : "h-[420px]"
                }`}
              />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 rounded bg-[#EFEBE5]" />
                <div className="h-3 w-full rounded bg-[#EFEBE5]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        {!posts.length ? (
          <div className="py-24 text-center">
            <p className="mb-3 font-serif text-3xl text-[#191919]">
              Nothing here just yet.
            </p>
            <p className="text-sm text-[#99918B]">
              The next photograph could be yours.
            </p>
          </div>
        ) : (
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
