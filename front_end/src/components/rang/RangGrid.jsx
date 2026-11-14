import React, { useState } from "react";
import RangPost from "./RangPost";
import RangPostDetail from "./RangPostDetail";
import { Palette } from "lucide-react";

const RangGrid = ({ posts = [], loading = false, currentUserId }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  if (loading) {
    return (
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="mb-5 break-inside-avoid animate-pulse overflow-hidden rounded-xl border border-[#8A2BE2]/20 bg-[#070F2B]"
          >
            <div
              className={`bg-[#0A1640] ${
                item % 3 === 0 ? "h-[360px]" : item % 2 === 0 ? "h-[280px]" : "h-[420px]"
              }`}
            />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 rounded bg-[#0E1E54]" />
              <div className="h-3 w-1/2 rounded bg-[#0E1E54]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#8A2BE2]/20 bg-[#070F2B] px-6 py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 text-[#8A2BE2]">
          <Palette size={32} />
        </div>
        <p className="font-['Orbitron'] text-xl font-bold text-white">The Canvas Awaits</p>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
          Be the pioneer artist on Rang Manch. Share your visual artwork, sketches, digital paintings, and illustrations with the PRATIVA community.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
        {posts.map((post) => (
          <RangPost key={post._id} post={post} onOpen={setSelectedPost} />
        ))}
      </div>

      {selectedPost && (
        <RangPostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

export default RangGrid;
