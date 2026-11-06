import mongoose from "mongoose";
import SavedPost from "../models/savedPostModel.js";
import Post from "../models/postModel.js";
import Profile from "../models/profileModel.js";

// SAVE POST
export const savePost = async (req, res) => {
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
      Profile.exists({ user: userId }),
      Post.exists({ _id: postId }),
    ]);

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Create your profile before saving posts.",
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const existingSave = await SavedPost.findOne({
      user: userId,
      post: postId,
    });

    if (existingSave) {
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Post is already saved.",
      });
    }

    await SavedPost.create({
      user: userId,
      post: postId,
    });

    return res.status(201).json({
      success: true,
      saved: true,
      message: "Post saved.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Post is already saved.",
      });
    }

    console.error("Save post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save post.",
    });
  }
};

// REMOVE SAVED POST
export const unsavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    await SavedPost.findOneAndDelete({
      user: userId,
      post: postId,
    });

    return res.status(200).json({
      success: true,
      saved: false,
      message: "Post removed from saved posts.",
    });
  } catch (error) {
    console.error("Unsave post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove saved post.",
    });
  }
};

// CHECK IF POST IS SAVED
export const getSaveStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const saved = await SavedPost.exists({
      user: userId,
      post: postId,
    });

    return res.status(200).json({
      success: true,
      saved: Boolean(saved),
    });
  } catch (error) {
    console.error("Save status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check saved status.",
    });
  }
};

// GET USER'S SAVED POSTS
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [savedPosts, total] = await Promise.all([
      SavedPost.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "post",
          populate: {
            path: "author",
            select: "name",
          },
        })
        .lean(),

      SavedPost.countDocuments({ user: userId }),
    ]);

    const validSavedPosts = savedPosts.filter((item) => item.post);

    const authorIds = validSavedPosts.map((item) => item.post.author?._id);

    const profiles = await Profile.find({
      user: { $in: authorIds },
    }).select("user username profileImage");

    const profileMap = new Map(
      profiles.map((profile) => [profile.user.toString(), profile]),
    );

    const posts = validSavedPosts.map((item) => ({
      ...item.post,
      authorProfile: profileMap.get(item.post.author?._id?.toString()) || null,
      savedAt: item.createdAt,
    }));

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + validSavedPosts.length < total,
      },
    });
  } catch (error) {
    console.error("Get saved posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch saved posts.",
    });
  }
};
