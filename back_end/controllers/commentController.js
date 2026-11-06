import mongoose from "mongoose";
import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import Profile from "../models/profileModel.js";

// Attach profile information to comments
const attachCommentProfiles = async (comments) => {
  if (!comments.length) return [];

  const userIds = comments.map((comment) => comment.user?._id || comment.user);

  const profiles = await Profile.find({
    user: { $in: userIds },
  }).select("user username profileImage");

  const profileMap = new Map(
    profiles.map((profile) => [profile.user.toString(), profile]),
  );

  return comments.map((comment) => {
    const userId = (comment.user?._id || comment.user).toString();

    return {
      ...comment,
      userProfile: profileMap.get(userId) || null,
    };
  });
};

// CREATE COMMENT
export const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters.",
      });
    }

    const [profile, post] = await Promise.all([
      Profile.findOne({ user: userId }),
      Post.findById(postId),
    ]);

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Create your profile before commenting.",
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = await Comment.create({
      user: userId,
      post: postId,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name")
      .lean();

    const [formattedComment] = await attachCommentProfiles([populatedComment]);

    return res.status(201).json({
      success: true,
      message: "Comment added.",
      comment: formattedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add comment.",
    });
  }
};

// GET COMMENTS
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const postExists = await Post.exists({ _id: postId });

    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .sort({ createdAt: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name")
        .lean(),

      Comment.countDocuments({ post: postId }),
    ]);

    const formattedComments = await attachCommentProfiles(comments);

    return res.status(200).json({
      success: true,
      comments: formattedComments,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + comments.length < total,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch comments.",
    });
  }
};

// DELETE OWN COMMENT
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID.",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete someone else's comment.",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted.",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete comment.",
    });
  }
};
