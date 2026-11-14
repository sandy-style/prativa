import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import Profile from "../models/profileModel.js";

// GET NOTIFICATIONS (PAGINATED WITH UNREAD COUNT)
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name")
        .populate("post", "title category media")
        .populate("event", "name slug bannerImage")
        .populate("competition", "title slug")
        .lean(),

      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    // Attach sender profiles
    const senderIds = notifications
      .filter((n) => n.sender)
      .map((n) => n.sender._id || n.sender);

    const senderProfiles = await Profile.find({
      user: { $in: senderIds },
    }).select("user username profileImage");

    const profileMap = new Map(
      senderProfiles.map((p) => [p.user.toString(), p]),
    );

    const formattedNotifications = notifications.map((n) => ({
      ...n,
      senderProfile: n.sender
        ? profileMap.get((n.sender._id || n.sender).toString()) || null
        : null,
    }));

    return res.status(200).json({
      success: true,
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch notifications.",
    });
  }
};

// MARK SINGLE NOTIFICATION AS READ
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true } },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};

// MARK ALL AS READ
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
};

// DELETE A NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted.",
      unreadCount,
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete notification.",
    });
  }
};
