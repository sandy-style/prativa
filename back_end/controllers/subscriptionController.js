import mongoose from "mongoose";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";
import { notifyNewSubscriber } from "../services/notificationService.js";

// SUBSCRIBE TO A CREATOR
export const subscribe = async (req, res) => {
  try {
    const subscriberId = req.user.id;
    const { creatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    if (subscriberId.toString() === creatorId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot subscribe to yourself.",
      });
    }

    // Verify creator exists
    const creatorExists = await User.exists({ _id: creatorId });
    if (!creatorExists) {
      return res.status(404).json({
        success: false,
        message: "Creator not found.",
      });
    }

    // Prevent duplicates
    try {
      await Subscription.create({
        subscriber: subscriberId,
        creator: creatorId,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(200).json({
          success: true,
          subscribed: true,
          message: "You are already subscribed to this creator.",
        });
      }
      throw error;
    }

    // Trigger notification
    notifyNewSubscriber(creatorId, subscriberId).catch((err) =>
      console.error("Subscription notification err:", err),
    );

    const subscriberCount = await Subscription.countDocuments({
      creator: creatorId,
    });

    return res.status(201).json({
      success: true,
      subscribed: true,
      message: "Subscribed successfully.",
      subscriberCount,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to subscribe to creator.",
    });
  }
};

// UNSUBSCRIBE FROM A CREATOR
export const unsubscribe = async (req, res) => {
  try {
    const subscriberId = req.user.id;
    const { creatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    await Subscription.findOneAndDelete({
      subscriber: subscriberId,
      creator: creatorId,
    });

    const subscriberCount = await Subscription.countDocuments({
      creator: creatorId,
    });

    return res.status(200).json({
      success: true,
      subscribed: false,
      message: "Unsubscribed successfully.",
      subscriberCount,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to unsubscribe.",
    });
  }
};

// CHECK SUBSCRIPTION STATUS & SUBSCRIBER COUNT
export const getSubscriptionStatus = async (req, res) => {
  try {
    const subscriberId = req.user.id;
    const { creatorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    const [isSubscribed, subscriberCount, followingCount] = await Promise.all([
      Subscription.exists({
        subscriber: subscriberId,
        creator: creatorId,
      }),
      Subscription.countDocuments({ creator: creatorId }),
      Subscription.countDocuments({ subscriber: creatorId }),
    ]);

    return res.status(200).json({
      success: true,
      subscribed: Boolean(isSubscribed),
      subscriberCount,
      followingCount,
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to check subscription status.",
    });
  }
};

// GET CREATORS SUBSCRIBED TO BY CURRENT USER
export const getSubscribedCreators = async (req, res) => {
  try {
    const subscriberId = req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      Subscription.find({ subscriber: subscriberId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("creator", "name email")
        .lean(),
      Subscription.countDocuments({ subscriber: subscriberId }),
    ]);

    const creatorIds = subscriptions
      .filter((s) => s.creator)
      .map((s) => s.creator._id || s.creator);

    const profiles = await Profile.find({
      user: { $in: creatorIds },
    }).select("user username bio profileImage");

    const profileMap = new Map(
      profiles.map((p) => [p.user.toString(), p]),
    );

    const creators = subscriptions
      .filter((s) => s.creator)
      .map((s) => ({
        user: s.creator,
        profile: profileMap.get((s.creator._id || s.creator).toString()) || null,
        subscribedAt: s.createdAt,
      }));

    return res.status(200).json({
      success: true,
      creators,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + creators.length < total,
      },
    });
  } catch (error) {
    console.error("Get subscribed creators error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscriptions.",
    });
  }
};

// GET SUBSCRIBERS OF A CREATOR
export const getCreatorSubscribers = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid creator ID.",
      });
    }

    const [subscribers, total] = await Promise.all([
      Subscription.find({ creator: creatorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("subscriber", "name")
        .lean(),
      Subscription.countDocuments({ creator: creatorId }),
    ]);

    const userIds = subscribers
      .filter((s) => s.subscriber)
      .map((s) => s.subscriber._id || s.subscriber);

    const profiles = await Profile.find({
      user: { $in: userIds },
    }).select("user username profileImage");

    const profileMap = new Map(
      profiles.map((p) => [p.user.toString(), p]),
    );

    const list = subscribers
      .filter((s) => s.subscriber)
      .map((s) => ({
        user: s.subscriber,
        profile: profileMap.get((s.subscriber._id || s.subscriber).toString()) || null,
        subscribedAt: s.createdAt,
      }));

    return res.status(200).json({
      success: true,
      subscribers: list,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + list.length < total,
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscribers.",
    });
  }
};
