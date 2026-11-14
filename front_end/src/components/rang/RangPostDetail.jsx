import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Send,
  Trash2,
  LoaderCircle,
  X,
  Flag,
  UserCheck,
  UserPlus,
} from "lucide-react";
import ReportModal from "../ReportModal";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const RangPostDetail = ({ post: initialPost, onClose, onPostUpdated, currentUserId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(initialPost?.likesCount || 0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const postId = post?._id;
  const authorId = post?.author?._id || post?.author;
  const isAuthor = user && authorId && user._id?.toString() === authorId.toString();

  useEffect(() => {
    if (!postId) return;

    // Fetch comments
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await axios.get(`${API_URL}/api/comment/${postId}`);
        if (res.data.success) {
          setComments(res.data.comments || []);
        }
      } catch (err) {
        console.error("Fetch comments err:", err);
      } finally {
        setLoadingComments(false);
      }
    };

    // Fetch like & save status if logged in
    const fetchStatuses = async () => {
      if (!user) return;
      try {
        const [likeRes, saveRes] = await Promise.all([
          axios.get(`${API_URL}/api/like/${postId}`, { withCredentials: true }).catch(() => null),
          axios.get(`${API_URL}/api/saved/${postId}`, { withCredentials: true }).catch(() => null),
        ]);

        if (likeRes?.data?.success) {
          setLiked(likeRes.data.liked);
          setLikesCount(likeRes.data.likeCount);
        }
        if (saveRes?.data?.success) {
          setSaved(saveRes.data.saved);
        }
      } catch (err) {
        console.error("Statuses check error:", err);
      }
    };

    // Fetch subscription status
    const fetchSubStatus = async () => {
      if (!authorId || !user) return;
      try {
        const res = await axios.get(`${API_URL}/api/subscriptions/creator/${authorId}/status`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setIsSubscribed(res.data.subscribed);
          setSubscriberCount(res.data.subscriberCount);
        }
      } catch (err) {}
    };

    fetchComments();
    fetchStatuses();
    fetchSubStatus();
  }, [postId, authorId, user]);

  const handleToggleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (liked) {
        const res = await axios.delete(`${API_URL}/api/like/${postId}`, { withCredentials: true });
        if (res.data.success) {
          setLiked(false);
          setLikesCount(res.data.likeCount);
        }
      } else {
        const res = await axios.post(`${API_URL}/api/like/${postId}`, {}, { withCredentials: true });
        if (res.data.success) {
          setLiked(true);
          setLikesCount(res.data.likeCount);
        }
      }
    } catch (err) {
      console.error("Like toggle err:", err);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (saved) {
        await axios.delete(`${API_URL}/api/saved/${postId}`, { withCredentials: true });
        setSaved(false);
      } else {
        await axios.post(`${API_URL}/api/saved/${postId}`, {}, { withCredentials: true });
        setSaved(true);
      }
    } catch (err) {
      console.error("Save toggle err:", err);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (isSubscribed) {
        const res = await axios.delete(`${API_URL}/api/subscriptions/${authorId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setIsSubscribed(false);
          setSubscriberCount(res.data.subscriberCount);
        }
      } else {
        const res = await axios.post(`${API_URL}/api/subscriptions/${authorId}`, {}, {
          withCredentials: true,
        });
        if (res.data.success) {
          setIsSubscribed(true);
          setSubscriberCount(res.data.subscriberCount);
        }
      }
    } catch (err) {
      console.error("Subscribe toggle err:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await axios.post(
        `${API_URL}/api/comment/${postId}`,
        { content: commentText.trim() },
        { withCredentials: true }
      );
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Add comment err:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const image = post?.media?.url || post?.image;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 sm:p-6 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#8A2BE2]/30 bg-[#070F2B] shadow-2xl lg:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/90"
        >
          <X size={18} />
        </button>

        {/* Artwork Image View */}
        <div className="relative flex flex-1 items-center justify-center bg-[#050A30] p-4">
          {image ? (
            <img src={image} alt={post.title} className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain" />
          ) : (
            <div className="text-slate-500">Image unavailable</div>
          )}
        </div>

        {/* Sidebar Info & Comments */}
        <div className="flex w-full flex-col border-t border-white/10 bg-[#070F2B] lg:w-[380px] lg:border-l lg:border-t-0">
          {/* Creator Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <Link
              to={`/profile/${authorId}`}
              className="flex items-center gap-3 transition hover:opacity-80"
              onClick={onClose}
            >
              <div className="h-10 w-10 overflow-hidden rounded-full border border-[#8A2BE2]/40 bg-[#0B1F6B]">
                {post.authorProfile?.profileImage ? (
                  <img src={post.authorProfile.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {post.author?.name?.[0] || "A"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{post.author?.name || "Artist"}</p>
                <p className="text-[11px] text-[#A7B5D8]">@{post.authorProfile?.username || "creator"}</p>
              </div>
            </Link>

            {/* Subscribe Button */}
            {!isAuthor && (
              <button
                type="button"
                onClick={handleToggleSubscribe}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Orbitron'] text-[10px] font-semibold transition ${
                  isSubscribed
                    ? "border border-white/20 bg-white/10 text-white"
                    : "bg-gradient-to-r from-[#8A2BE2] to-[#FF4DB8] text-white shadow-[0_0_12px_rgba(255,77,184,0.3)] hover:scale-105"
                }`}
              >
                {isSubscribed ? <UserCheck size={12} /> : <UserPlus size={12} />}
                <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
              </button>
            )}
          </div>

          {/* Post Description & Tags */}
          <div className="border-b border-white/10 p-4">
            <h3 className="font-['Orbitron'] text-sm font-bold text-white">{post.title || "Untitled Artwork"}</h3>
            {post.description && (
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{post.description}</p>
            )}
            {post.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.tags.map((t, i) => (
                  <span key={i} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[#FF4DB8]">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleToggleLike}
                className="flex items-center gap-1 text-xs text-slate-300 transition hover:text-[#FF4DB8]"
              >
                <Heart size={18} className={liked ? "fill-[#FF4DB8] text-[#FF4DB8]" : ""} />
                <span className="font-semibold text-white">{likesCount}</span>
              </button>
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <MessageCircle size={18} className="text-[#8A2BE2]" />
                <span className="font-semibold text-white">{comments.length}</span>
              </div>
              <button
                type="button"
                onClick={handleToggleSave}
                className="text-slate-300 transition hover:text-white"
              >
                <Bookmark size={18} className={saved ? "fill-white text-white" : ""} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400"
            >
              <Flag size={13} />
              <span>Report</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-60 lg:max-h-none">
            {loadingComments ? (
              <div className="flex justify-center py-6 text-slate-500">
                <LoaderCircle size={20} className="animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="flex gap-2.5 text-xs">
                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-slate-700">
                    {c.userProfile?.profileImage ? (
                      <img src={c.userProfile.profileImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-white">
                        {c.user?.name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                      {c.userProfile?.username ? `@${c.userProfile.username}` : c.user?.name || "User"}
                    </p>
                    <p className="text-slate-300 break-words">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#081326] px-3 py-1.5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a thoughtful comment..."
                maxLength={1000}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="text-[#FF4DB8] transition hover:text-white disabled:opacity-30"
              >
                {submittingComment ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={postId}
          targetTitle={post.title}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default RangPostDetail;
