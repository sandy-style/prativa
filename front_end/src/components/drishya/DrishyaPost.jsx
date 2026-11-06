import React from "react";

const DrishyaPost = ({ post, onOpen }) => {
  if (!post) return null;

  const image = post.media?.url || post.image || "";

  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-xl border border-[#EAE6E0] bg-white">
      <button
        type="button"
        onClick={() => onOpen?.(post)}
        className="block w-full overflow-hidden bg-[#F1EFEB] text-left"
        aria-label={`Open photograph: ${post.title || "Photography"}`}
      >
        {image ? (
          <img
            src={image}
            alt={post.title || "Photography"}
            loading="lazy"
            className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-sm text-[#99918B]">
            Photograph unavailable
          </div>
        )}
      </button>
    </article>
  );
};

export default DrishyaPost;
