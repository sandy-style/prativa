import mongoose from "mongoose";
import Like from "../models/likeModel.js";
import Post from "../models/postModel.js";
import Profile from "../models/profileModel.js";

// LIKE A POST
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const [profile, post] = await Promise.all([
      Profile.findOne({ user: userId }),
      Post.findById(postId),
    ]);

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Create your profile before liking posts.",
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    try {
      await Like.create({
        user: userId,
        post: postId,
      });
    } catch (error) {
      // Prevent duplicate likes
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already liked this post.",
        });
      }

      throw error;
    }

    const likeCount = await Like.countDocuments({
      post: postId,
    });

    return res.status(201).json({
      success: true,
      message: "Post liked.",
      likeCount,
    });
  } catch (error) {
    console.error("Like post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to like this post.",
    });
  }
};

// UNLIKE A POST
export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    await Like.findOneAndDelete({
      user: userId,
      post: postId,
    });

    const likeCount = await Like.countDocuments({
      post: postId,
    });

    return res.status(200).json({
      success: true,
      message: "Post unliked.",
      likeCount,
    });
  } catch (error) {
    console.error("Unlike post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to unlike this post.",
    });
  }
};

// GET LIKE STATUS AND COUNT
export const getLikeStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const [liked, likeCount] = await Promise.all([
      Like.exists({
        user: userId,
        post: postId,
      }),

      Like.countDocuments({
        post: postId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      liked: Boolean(liked),
      likeCount,
    });
  } catch (error) {
    console.error("Get like status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch like status.",
    });
  }
};
