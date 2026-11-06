import mongoose from "mongoose";
import Post from "../models/postModel.js";
import Profile from "../models/profileModel.js";
import { v2 as cloudinary } from "cloudinary";
import Like from "../models/likeModel.js";
import Comment from "../models/commentModel.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const categories = ["voice", "vision", "art", "words"];

const fontStyles = ["serif", "sans", "devanagari", "handwritten"];

const textAlignments = ["left", "center", "right"];

// Identify uploaded media
const getMediaType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  return null;
};

// Upload image or audio to Cloudinary
const uploadMedia = (file, category, mediaType) => {
  return new Promise((resolve, reject) => {
    // Cloudinary uses "video" resource_type for audio files.
    const resourceType = mediaType === "image" ? "image" : "video";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `prativa/${category}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

// Delete media from Cloudinary
const deleteCloudinaryMedia = async (media) => {
  if (!media?.publicId) return;

  const resourceType = media.type === "image" ? "image" : "video";

  await cloudinary.uploader.destroy(media.publicId, {
    resource_type: resourceType,
  });
};

// Pagination
const getPagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(30, Math.max(1, Number(query.limit) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// Add profile information to posts
const attachAuthorProfiles = async (posts) => {
  if (!posts.length) return [];

  const userIds = posts.map((post) => post.author?._id || post.author);

  const profiles = await Profile.find({
    user: { $in: userIds },
  }).select("user username profileImage");

  const profileMap = new Map(
    profiles.map((profile) => [profile.user.toString(), profile]),
  );

  return posts.map((post) => {
    const authorId = (post.author?._id || post.author).toString();

    return {
      ...post,
      authorProfile: profileMap.get(authorId) || null,
    };
  });
};

// Parse and clean tags
const parseTags = (tags) => {
  if (!tags) return [];

  let parsedTags = [];

  if (Array.isArray(tags)) {
    parsedTags = tags;
  } else {
    try {
      const parsed = JSON.parse(tags);
      parsedTags = Array.isArray(parsed) ? parsed : [tags];
    } catch {
      parsedTags = tags.split(",");
    }
  }

  return [
    ...new Set(
      parsedTags
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
        .map((tag) => tag.slice(0, 30)),
    ),
  ].slice(0, 10);
};

// CREATE POST
export const createPost = async (req, res) => {
  let uploadedMedia;

  try {
    const userId = req.user.id;

    const {
      category,
      title,
      description,
      content,
      tags,
      fontStyle,
      textAlign,
    } = req.body;

    // Validate category
    if (!categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid category.",
      });
    }

    // Check profile
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Create your profile before publishing.",
      });
    }

    // Validate text fields
    if (title !== undefined && typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid title.",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid description.",
      });
    }

    if (title && title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 100 characters.",
      });
    }

    if (description && description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters.",
      });
    }

    let media;

    // WORDS: Text only
    if (category === "words") {
      if (req.file) {
        return res.status(400).json({
          success: false,
          message: "Words posts do not support file uploads.",
        });
      }

      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Please write something before publishing.",
        });
      }

      if (content.length > 10000) {
        return res.status(400).json({
          success: false,
          message: "Content cannot exceed 10000 characters.",
        });
      }

      if (fontStyle && !fontStyles.includes(fontStyle)) {
        return res.status(400).json({
          success: false,
          message: "Invalid font style.",
        });
      }

      if (textAlign && !textAlignments.includes(textAlign)) {
        return res.status(400).json({
          success: false,
          message: "Invalid text alignment.",
        });
      }
    }

    // VOICE, VISION AND ART: Media only
    else {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload your work.",
        });
      }

      const mediaType = getMediaType(req.file.mimetype);

      if (!mediaType) {
        return res.status(400).json({
          success: false,
          message: "Only photos and audio files are allowed.",
        });
      }

      // Voice accepts audio only
      if (category === "voice" && mediaType !== "audio") {
        return res.status(400).json({
          success: false,
          message: "Voice posts must contain audio.",
        });
      }

      // Vision accepts photos only
      if (category === "vision" && mediaType !== "image") {
        return res.status(400).json({
          success: false,
          message: "Vision posts must contain photos.",
        });
      }

      // Art accepts photos only
      if (category === "art" && mediaType !== "image") {
        return res.status(400).json({
          success: false,
          message: "Art posts must contain photos.",
        });
      }

      uploadedMedia = await uploadMedia(req.file, category, mediaType);

      media = {
        type: mediaType,
        url: uploadedMedia.secure_url,
        publicId: uploadedMedia.public_id,
        thumbnail: "",
        duration: uploadedMedia.duration || 0,
      };
    }

    // Create post
    const post = await Post.create({
      author: userId,
      category,
      title: title?.trim() || "",
      description: description?.trim() || "",
      content: category === "words" ? content.trim() : "",
      media,
      fontStyle: category === "words" ? fontStyle || "serif" : undefined,
      textAlign: category === "words" ? textAlign || "left" : undefined,
      tags: parseTags(tags),
    });

    return res.status(201).json({
      success: true,
      message: "Your work has been published.",
      post,
    });
  } catch (error) {
    // Clean up Cloudinary upload if database save fails
    if (uploadedMedia?.public_id) {
      const resourceType = uploadedMedia.resource_type || "image";

      await cloudinary.uploader
        .destroy(uploadedMedia.public_id, {
          resource_type: resourceType,
        })
        .catch(() => {});
    }

    console.error("Create post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to publish your post.",
    });
  }
};

// GET EXPLORE FEED

export const getFeed = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, tag, sort = "latest" } = req.query;

    const filter = {};

    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category.",
        });
      }

      filter.category = category;
    }

    if (tag) {
      filter.tags = String(tag).trim().toLowerCase();
    }

    const sortOptions = {
      latest: { createdAt: -1, _id: -1 },
      "most-liked": { likesCount: -1, createdAt: -1 },
      "most-discussed": { commentsCount: -1, createdAt: -1 },
    };

    if (!sortOptions[sort]) {
      return res.status(400).json({
        success: false,
        message: "Invalid sorting option.",
      });
    }

    const [posts, total] = await Promise.all([
      Post.aggregate([
        { $match: filter },

        // Count likes without loading every like document
        {
          $lookup: {
            from: Like.collection.name,
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$post", "$$postId"] },
                },
              },
              { $count: "count" },
            ],
            as: "likeStats",
          },
        },

        // Count comments
        {
          $lookup: {
            from: Comment.collection.name,
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$post", "$$postId"] },
                },
              },
              { $count: "count" },
            ],
            as: "commentStats",
          },
        },

        {
          $addFields: {
            likesCount: {
              $ifNull: [{ $arrayElemAt: ["$likeStats.count", 0] }, 0],
            },
            commentsCount: {
              $ifNull: [{ $arrayElemAt: ["$commentStats.count", 0] }, 0],
            },
          },
        },

        { $sort: sortOptions[sort] },
        { $skip: skip },
        { $limit: limit },

        // Get creator name
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorData",
          },
        },

        {
          $unwind: {
            path: "$authorData",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Get creator profile
        {
          $lookup: {
            from: Profile.collection.name,
            localField: "author",
            foreignField: "user",
            as: "profileData",
          },
        },

        {
          $project: {
            _id: 1,
            author: {
              _id: "$authorData._id",
              name: "$authorData.name",
            },
            authorProfile: {
              $ifNull: [{ $arrayElemAt: ["$profileData", 0] }, null],
            },
            category: 1,
            title: 1,
            description: 1,
            content: 1,
            media: 1,
            fontStyle: 1,
            textAlign: 1,
            tags: 1,
            createdAt: 1,
            updatedAt: 1,
            likesCount: 1,
            commentsCount: 1,
          },
        },
      ]),

      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error("Get feed error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch posts.",
    });
  }
};

// GET POSTS FROM A USER'S PROFILE
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const { page, limit, skip } = getPagination(req.query);

    const [posts, total] = await Promise.all([
      Post.find({ author: userId })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name")
        .lean(),

      Post.countDocuments({ author: userId }),
    ]);

    const formattedPosts = await attachAuthorProfiles(posts);

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user's posts.",
    });
  }
};

// GET SINGLE POST
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(postId).populate("author", "name").lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const [formattedPost] = await attachAuthorProfiles([post]);

    return res.status(200).json({
      success: true,
      post: formattedPost,
    });
  } catch (error) {
    console.error("Get post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch post.",
    });
  }
};

// DELETE OWN POST
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

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

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete someone else's post.",
      });
    }

    await Post.findByIdAndDelete(postId);

    if (post.media?.publicId) {
      await deleteCloudinaryMedia(post.media).catch((error) => {
        console.error("Cloudinary deletion error:", error);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete post.",
    });
  }
};
