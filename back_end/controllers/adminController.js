import mongoose from "mongoose";
import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";
import Post from "../models/postModel.js";
import Like from "../models/likeModel.js";
import Comment from "../models/commentModel.js";
import Subscription from "../models/subscriptionModel.js";
import Report from "../models/reportModel.js";
import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import Competition from "../models/competitionModel.js";
import Winner from "../models/winnerModel.js";
import AuditLog from "../models/auditLogModel.js";
import Notification from "../models/notificationModel.js";
import { createNotification } from "../services/notificationService.js";

// GET ADMIN DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProfiles,
      totalPosts,
      totalLikes,
      totalComments,
      totalSubscriptions,
      totalReports,
      pendingReports,
      activeEvents,
      totalCompetitions,
      totalWinners,
      manchStats,
      recentUsers,
      recentPosts,
      recentReports,
    ] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Post.countDocuments(),
      Like.countDocuments(),
      Comment.countDocuments(),
      Subscription.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Event.countDocuments({ status: "published" }),
      Competition.countDocuments({ status: "active" }),
      Winner.countDocuments(),

      // Manch breakdown
      Post.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),

      // Recent users
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role status createdAt")
        .lean(),

      // Recent posts
      Post.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "name email")
        .select("title category author createdAt likesCount")
        .lean(),

      // Recent reports
      Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("reporter", "name")
        .select("targetType reason status createdAt")
        .lean(),
    ]);

    // Format Manch counts
    const manchMap = {
      voice: 0,
      vision: 0,
      art: 0,
      words: 0,
    };
    manchStats.forEach((item) => {
      if (item._id && manchMap[item._id] !== undefined) {
        manchMap[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCreators: totalProfiles,
        totalPosts,
        totalLikes,
        totalComments,
        totalSubscriptions,
        totalReports,
        pendingReports,
        activeEvents,
        totalCompetitions,
        totalWinners,
        manchDistribution: manchMap,
      },
      recentUsers,
      recentPosts,
      recentReports,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
};

// GET USERS LIST (ADMIN)
export const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const filter = {};

    if (role && role !== "all") filter.role = role;
    if (status && status !== "all") filter.status = status;

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id name email role status isVerified suspensionReason createdAt")
        .lean(),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);

    // Fetch associated profile, post count, and subscription count
    const [profiles, postCounts, subCounts] = await Promise.all([
      Profile.find({ user: { $in: userIds } }).select("user username profileImage bio").lean(),
      Post.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: "$author", count: { $sum: 1 } } },
      ]),
      Subscription.aggregate([
        { $match: { creator: { $in: userIds } } },
        { $group: { _id: "$creator", count: { $sum: 1 } } },
      ]),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));
    const postMap = new Map(postCounts.map((p) => [p._id.toString(), p.count]));
    const subMap = new Map(subCounts.map((s) => [s._id.toString(), s.count]));

    const formattedUsers = users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null,
      postsCount: postMap.get(u._id.toString()) || 0,
      subscriberCount: subMap.get(u._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + users.length < total,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
    });
  }
};

// GET USER DETAILS (ADMIN)
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const [user, profile, posts, subscribersCount, followingCount, reportsAgainst] = await Promise.all([
      User.findById(userId).select("-password").lean(),
      Profile.findOne({ user: userId }).lean(),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Subscription.countDocuments({ creator: userId }),
      Subscription.countDocuments({ subscriber: userId }),
      Report.find({ targetUser: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      profile,
      posts,
      subscribersCount,
      followingCount,
      reportsAgainst,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user details.",
    });
  }
};

// UPDATE USER STATUS / ROLE (ADMIN)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, role, suspensionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Protect self from losing admin rights accidentally
    if (userId.toString() === req.user.id.toString() && role && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot revoke your own administrator role.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (status && ["active", "suspended", "restricted"].includes(status)) {
      user.status = status;
      if (status === "suspended") {
        user.suspensionReason = suspensionReason || "Suspended by administrator";
      } else {
        user.suspensionReason = "";
      }
    }

    if (role && ["user", "admin", "moderator"].includes(role)) {
      user.role = role;
    }

    await user.save();

    await AuditLog.create({
      admin: req.user.id,
      action: "user_updated",
      targetType: "user",
      targetId: user._id,
      details: { status: user.status, role: user.role, suspensionReason: user.suspensionReason },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        suspensionReason: user.suspensionReason,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
};

// GET POSTS FOR MODERATION / MANAGEMENT (ADMIN)
export const getAdminPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "all") filter.category = category;
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email")
        .lean(),
      Post.countDocuments(filter),
    ]);

    const postIds = posts.map((p) => p._id);
    const authorIds = posts.map((p) => p.author?._id || p.author);

    const [likesCounts, commentsCounts, profiles] = await Promise.all([
      Like.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),
      Comment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),
      Profile.find({ user: { $in: authorIds } }).select("user username profileImage").lean(),
    ]);

    const likeMap = new Map(likesCounts.map((l) => [l._id.toString(), l.count]));
    const commentMap = new Map(commentsCounts.map((c) => [c._id.toString(), c.count]));
    const profileMap = new Map(profiles.map((pr) => [pr.user.toString(), pr]));

    const formattedPosts = posts.map((post) => ({
      ...post,
      likesCount: likeMap.get(post._id.toString()) || 0,
      commentsCount: commentMap.get(post._id.toString()) || 0,
      authorProfile: profileMap.get(post.author?._id?.toString()) || null,
    }));

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
    console.error("Get admin posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch posts.",
    });
  }
};

// GET AUDIT LOGS (ADMIN)
export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("admin", "name email")
        .lean(),
      AuditLog.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + logs.length < total,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch audit logs.",
    });
  }
};

// SEND PLATFORM ANNOUNCEMENT / ADMIN NOTIFICATION
export const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, link, targetAudience = "all" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    const filter = { isVerified: true, status: "active" };

    const users = await User.find(filter).select("_id");

    const notifications = users.map((u) => ({
      recipient: u._id,
      sender: req.user.id,
      type: "admin_notice",
      title: title.trim(),
      message: message.trim(),
      link: link || "",
    }));

    if (notifications.length) {
      await Notification.insertMany(notifications, { ordered: false });
    }

    await AuditLog.create({
      admin: req.user.id,
      action: "announcement_sent",
      targetType: "setting",
      details: { title, count: notifications.length },
    });

    return res.status(200).json({
      success: true,
      message: `Announcement successfully broadcast to ${notifications.length} members.`,
    });
  } catch (error) {
    console.error("Send announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to broadcast announcement.",
    });
  }
};
