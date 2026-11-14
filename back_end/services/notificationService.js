import Notification from "../models/notificationModel.js";
import Milestone from "../models/milestoneModel.js";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  post = null,
  event = null,
  competition = null,
  metadata = {},
}) => {
  try {
    if (!recipient) return null;

    // Do not notify yourself
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      post,
      event,
      competition,
      metadata,
    });
  } catch (error) {
    console.error("Notification creation error:", error);
    return null;
  }
};

// Notify all subscribers when a creator publishes a post
export const notifySubscribers = async (authorId, post) => {
  try {
    const subscriptions = await Subscription.find({
      creator: authorId,
    }).select("subscriber");

    if (!subscriptions.length) return;

    const [authorUser, authorProfile] = await Promise.all([
      User.findById(authorId).select("name"),
      Profile.findOne({ user: authorId }).select("username"),
    ]);

    const creatorName = authorProfile?.username
      ? `@${authorProfile.username}`
      : authorUser?.name || "A creator you follow";

    const manchNames = {
      voice: "Swar Manch",
      vision: "Drishya Manch",
      art: "Rang Manch",
      words: "Shabda Manch",
    };

    const manch = manchNames[post.category] || "PRATIVA";
    const postTitle = post.title ? `"${post.title}"` : `a new ${post.category} creation`;

    const notifications = subscriptions.map((sub) => ({
      recipient: sub.subscriber,
      sender: authorId,
      type: "new_post",
      title: `New post from ${creatorName}`,
      message: `${creatorName} published ${postTitle} in ${manch}.`,
      link: `/profile/${authorId}`,
      post: post._id,
      metadata: {
        category: post.category,
        postId: post._id,
      },
    }));

    await Notification.insertMany(notifications, { ordered: false });
  } catch (error) {
    console.error("Notify subscribers error:", error);
  }
};

// Automatic like milestones: 100, 200, 300, etc.
// Enforced via unique (post, milestone) in Milestone model to guarantee exactly-once delivery!
export const checkAndNotifyLikeMilestone = async (post, currentLikes, step = 100) => {
  try {
    if (!post || currentLikes < step) return;

    // Calculate the highest reached multiple of `step`
    const reachedMilestone = Math.floor(currentLikes / step) * step;

    if (reachedMilestone <= 0) return;

    // Check if this milestone has already been awarded
    const alreadyRecorded = await Milestone.exists({
      post: post._id,
      milestone: reachedMilestone,
    });

    if (alreadyRecorded) return;

    // Try atomic record insertion
    try {
      await Milestone.create({
        post: post._id,
        author: post.author,
        milestone: reachedMilestone,
        likeCountAtAchievement: currentLikes,
      });
    } catch (err) {
      // Duplicate key (race condition) -> safely exit
      if (err.code === 11000) return;
      throw err;
    }

    const postTitle = post.title ? `"${post.title}"` : "Your post";

    await createNotification({
      recipient: post.author,
      type: "like_milestone",
      title: `Milestone: ${reachedMilestone} Likes!`,
      message: `Congratulations! ${postTitle} has reached ${reachedMilestone} likes. Keep creating!`,
      link: `/profile/${post.author}`,
      post: post._id,
      metadata: {
        milestone: reachedMilestone,
        currentLikes,
      },
    });
  } catch (error) {
    console.error("Check like milestone error:", error);
  }
};

// Notify author when someone likes their post
export const notifyPostLiked = async (post, likerId) => {
  try {
    if (post.author.toString() === likerId.toString()) return;

    const [likerUser, likerProfile] = await Promise.all([
      User.findById(likerId).select("name"),
      Profile.findOne({ user: likerId }).select("username"),
    ]);

    const likerName = likerProfile?.username
      ? `@${likerProfile.username}`
      : likerUser?.name || "Someone";

    const postTitle = post.title ? `"${post.title}"` : "your creation";

    // Deduplicate rapid like spam: check if notified recently for same liker and post
    const recentNotification = await Notification.findOne({
      recipient: post.author,
      sender: likerId,
      type: "post_liked",
      post: post._id,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // 1 hour window
    });

    if (recentNotification) return;

    await createNotification({
      recipient: post.author,
      sender: likerId,
      type: "post_liked",
      title: "New Like",
      message: `${likerName} liked ${postTitle}.`,
      link: `/profile/${post.author}`,
      post: post._id,
    });
  } catch (error) {
    console.error("Notify post liked error:", error);
  }
};

// Notify author when someone comments on their post
export const notifyPostCommented = async (post, commenterId, commentSnippet = "") => {
  try {
    if (post.author.toString() === commenterId.toString()) return;

    const [commenterUser, commenterProfile] = await Promise.all([
      User.findById(commenterId).select("name"),
      Profile.findOne({ user: commenterId }).select("username"),
    ]);

    const commenterName = commenterProfile?.username
      ? `@${commenterProfile.username}`
      : commenterUser?.name || "Someone";

    const snippet = commentSnippet.length > 50
      ? `"${commentSnippet.slice(0, 50)}..."`
      : `"${commentSnippet}"`;

    await createNotification({
      recipient: post.author,
      sender: commenterId,
      type: "post_commented",
      title: "New Comment",
      message: `${commenterName} commented: ${snippet}`,
      link: `/profile/${post.author}`,
      post: post._id,
    });
  } catch (error) {
    console.error("Notify post commented error:", error);
  }
};

// Notify creator of new subscriber
export const notifyNewSubscriber = async (creatorId, subscriberId) => {
  try {
    const [subUser, subProfile] = await Promise.all([
      User.findById(subscriberId).select("name"),
      Profile.findOne({ user: subscriberId }).select("username"),
    ]);

    const subName = subProfile?.username
      ? `@${subProfile.username}`
      : subUser?.name || "A new creator";

    await createNotification({
      recipient: creatorId,
      sender: subscriberId,
      type: "new_subscriber",
      title: "New Subscriber!",
      message: `${subName} subscribed to your profile.`,
      link: `/profile/${subscriberId}`,
    });
  } catch (error) {
    console.error("Notify new subscriber error:", error);
  }
};
