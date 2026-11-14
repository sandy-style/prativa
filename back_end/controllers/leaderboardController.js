import mongoose from "mongoose";

import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import EventSubmission from "../models/eventSubmissionModel.js";
import Post from "../models/postModel.js";
import Like from "../models/likeModel.js";
import AuditLog from "../models/auditLogModel.js";

// ======================================================
// HELPERS
// ======================================================

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getQualifyingLikeCount = async (postId, startDate, endDate) => {
  return Like.countDocuments({
    post: postId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

const getEventCategoryFilter = (event) => {
  return event.category === "all"
    ? ["voice", "vision", "art", "words"]
    : [event.category];
};

const writeLeaderboardAudit = async ({
  admin,
  action,
  event,
  details = {},
  ipAddress = "",
}) => {
  try {
    await AuditLog.create({
      admin,
      action,
      targetType: "event",
      targetId: event._id,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Leaderboard audit log error:", error);
  }
};

// Returns eligible posts for an event.
//
// Automatic:
// Posts created during the event period.
//
// Registration:
// Approved/published submissions belonging to confirmed registrations.
const getEventPosts = async (event) => {
  const now = new Date();
  const endDate = event.endDate < now ? event.endDate : now;

  if (event.participationMode === "automatic") {
    return Post.find({
      category: { $in: getEventCategoryFilter(event) },
      createdAt: {
        $gte: event.startDate,
        $lte: endDate,
      },
    })
      .populate("author", "name")
      .sort({ createdAt: 1 })
      .lean();
  }

  const submissions = await EventSubmission.find({
    event: event._id,
    status: "published",
    publishedPost: { $ne: null },
    category: { $in: getEventCategoryFilter(event) },
  })
    .populate("publishedPost")
    .populate({
      path: "registration",
      match: {
        registrationStatus: "confirmed",
        paymentStatus: {
          $in: ["not_required", "verified"],
        },
      },
    })
    .populate("user", "name")
    .sort({ publishedAt: 1, createdAt: 1 })
    .lean();

  return submissions
    .filter(
      (submission) =>
        submission.registration &&
        submission.publishedPost &&
        submission.publishedPost.author?.toString() ===
          submission.user?._id?.toString(),
    )
    .map((submission) => ({
      ...submission.publishedPost,
      author: submission.user,
      submissionId: submission._id,
      registrationId: submission.registration._id,
    }));
};

const buildEventLeaderboard = async (event) => {
  const now = new Date();
  const scoreEndDate = event.endDate < now ? event.endDate : now;

  const posts = await getEventPosts(event);

  const leaderboard = await Promise.all(
    posts.map(async (post) => {
      const likeCount = await getQualifyingLikeCount(
        post._id,
        event.startDate,
        scoreEndDate,
      );

      return {
        post,
        author: post.author,
        likes: likeCount,
        publishedAt: post.publishedAt || post.createdAt,
      };
    }),
  );

  leaderboard.sort((a, b) => {
    if (b.likes !== a.likes) {
      return b.likes - a.likes;
    }

    return (
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
  });

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
};

const saveEventWinner = async ({
  event,
  post,
  likes,
  reachedAt = new Date(),
}) => {
  if (!post?.author) return null;

  // Atomic lock: only one request can claim the winner.
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: event._id,
      status: "published",
      winner: null,
      isWinnerLocked: false,
    },
    {
      $set: {
        winner: post.author._id || post.author,
        winningPost: post._id,
        winnerReachedAt: reachedAt,
        winningLikesCount: likes,
        isWinnerLocked: true,
        winnerVerificationStatus: "pending",
        status: "completed",
      },
    },
    {
      new: true,
    },
  );

  return updatedEvent;
};

// ======================================================
// AUTOMATIC FIRST-TO-LIKES WINNER CHECK
// Called after a user likes a post.
// ======================================================

export const checkAutomaticEventWinner = async (
  postId,
  authorId,
  postCategory,
) => {
  if (!isValidId(postId) || !isValidId(authorId)) {
    return null;
  }

  const now = new Date();

  const activeEvents = await Event.find({
    status: "published",
    participationMode: "automatic",
    winningCriteria: "first_to_likes",
    isWinnerLocked: false,
    winner: null,
    startDate: { $lte: now },
    endDate: { $gte: now },
    entryFee: 0,
    $or: [{ category: "all" }, { category: postCategory }],
  }).lean();

  if (!activeEvents.length) return null;

  const post = await Post.findOne({
    _id: postId,
    author: authorId,
    category: postCategory,
    createdAt: {
      $gte: activeEvents.reduce(
        (earliest, event) =>
          event.startDate < earliest ? event.startDate : earliest,
        activeEvents[0].startDate,
      ),
      $lte: now,
    },
  }).lean();

  if (!post) return null;

  for (const event of activeEvents) {
    if (post.createdAt < event.startDate || post.createdAt > event.endDate) {
      continue;
    }

    const likes = await getQualifyingLikeCount(post._id, event.startDate, now);

    if (likes < event.likeThreshold) continue;

    const lockedEvent = await saveEventWinner({
      event,
      post,
      likes,
      reachedAt: now,
    });

    if (lockedEvent) {
      console.log(
        `Event "${lockedEvent.name}" completed. Winner post: ${post._id}`,
      );

      return lockedEvent;
    }
  }

  return null;
};

// ======================================================
// FINALIZE ONE EXPIRED EVENT
// ======================================================

export const finalizeEvent = async (eventId) => {
  if (!isValidId(eventId)) return null;

  const event = await Event.findOne({
    _id: eventId,
    status: "published",
    endDate: { $lte: new Date() },
  });

  if (!event) return null;

  // An automatic first-to-likes event only has a winner
  // if someone reached the configured threshold.
  if (event.winningCriteria === "first_to_likes") {
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: event._id,
        status: "published",
        winner: null,
        isWinnerLocked: false,
        endDate: { $lte: new Date() },
      },
      {
        $set: {
          status: "completed",
        },
      },
      { new: true },
    );

    return updatedEvent;
  }

  // Admin-selected events are completed by the admin.
  if (event.winningCriteria === "admin_selected") {
    return null;
  }

  // Events without a winner selection system.
  if (event.winningCriteria === "none") {
    return Event.findOneAndUpdate(
      {
        _id: event._id,
        status: "published",
      },
      {
        $set: {
          status: "completed",
        },
      },
      { new: true },
    );
  }

  // Highest-likes events select the leading eligible post.
  if (event.winningCriteria === "highest_likes") {
    const leaderboard = await buildEventLeaderboard(event);
    const leader = leaderboard[0];

    if (!leader || leader.likes < 1) {
      return Event.findOneAndUpdate(
        {
          _id: event._id,
          status: "published",
          winner: null,
        },
        {
          $set: {
            status: "completed",
          },
        },
        { new: true },
      );
    }

    return saveEventWinner({
      event,
      post: leader.post,
      likes: leader.likes,
      reachedAt: new Date(),
    });
  }

  return null;
};

// ======================================================
// FINALIZE ALL EXPIRED EVENTS
// ======================================================

export const finalizeExpiredEvents = async () => {
  const expiredEvents = await Event.find({
    status: "published",
    endDate: { $lte: new Date() },
    winningCriteria: {
      $in: ["none", "first_to_likes", "highest_likes"],
    },
  }).select("_id");

  const results = [];

  for (const event of expiredEvents) {
    try {
      const result = await finalizeEvent(event._id);

      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Failed to finalize event ${event._id}:`, error);
    }
  }

  return results;
};

// ======================================================
// PUBLIC: GET EVENT LEADERBOARD
// GET /api/leaderboard?eventId=...
// ======================================================

export const getLeaderboard = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (!eventId || !isValidId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "A valid eventId is required.",
      });
    }

    const event = await Event.findOne({
      _id: eventId,
      status: { $in: ["published", "completed"] },
    })
      .populate("winner", "name")
      .populate("winningPost")
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const leaderboard = await buildEventLeaderboard(event);

    return res.status(200).json({
      success: true,
      event,
      leaderboard,
      totalParticipants: leaderboard.length,
      isCompleted: event.status === "completed",
    });
  } catch (error) {
    console.error("Get event leaderboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch event leaderboard.",
    });
  }
};

// ======================================================
// PUBLIC: GET EVENTS THAT HAVE LEADERBOARDS
// ======================================================

export const getLeaderboardEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: { $in: ["published", "completed"] },
      winningCriteria: {
        $in: ["first_to_likes", "highest_likes", "admin_selected"],
      },
    })
      .select(
        "name slug bannerImage category participationMode winningCriteria likeThreshold prizeAmount prizeCurrency startDate endDate status winner winningPost winningLikesCount winnerVerificationStatus",
      )
      .populate("winner", "name")
      .sort({ startDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get leaderboard events error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch leaderboard events.",
    });
  }
};

// ======================================================
// ADMIN: GET EVENT WINNERS
// ======================================================

export const getAdminWinners = async (req, res) => {
  try {
    const events = await Event.find({
      winner: { $ne: null },
    })
      .populate("winner", "name email")
      .populate("winningPost")
      .populate("winnerVerifiedBy", "name")
      .populate("createdBy", "name")
      .sort({ winnerReachedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      winners: events.map((event) => ({
        _id: event._id,
        event,
        user: event.winner,
        post: event.winningPost,
        totalQualifyingLikes: event.winningLikesCount,
        reachedAt: event.winnerReachedAt,
        verificationStatus: event.winnerVerificationStatus,
        adminNotes: event.winnerAdminNotes,
        verifiedBy: event.winnerVerifiedBy,
        verifiedAt: event.winnerVerifiedAt,
      })),
    });
  } catch (error) {
    console.error("Get admin event winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch event winners.",
    });
  }
};

// ======================================================
// ADMIN: VERIFY OR REJECT EVENT WINNER
// PATCH /api/leaderboard/admin/winners/:winnerId
//
// winnerId is the Event ID in the new system.
// ======================================================

export const updateWinnerStatus = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { verificationStatus, adminNotes = "" } = req.body;

    if (!isValidId(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    if (!["verified", "pending", "rejected"].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid winner verification status.",
      });
    }

    const event = await Event.findOne({
      _id: winnerId,
      winner: { $ne: null },
      isWinnerLocked: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event winner not found.",
      });
    }

    event.winnerVerificationStatus = verificationStatus;
    event.winnerAdminNotes = String(adminNotes).trim();

    if (verificationStatus === "verified") {
      event.winnerVerifiedBy = req.user.id;
      event.winnerVerifiedAt = new Date();
    } else {
      event.winnerVerifiedBy = null;
      event.winnerVerifiedAt = null;
    }

    await event.save();

    await writeLeaderboardAudit({
      admin: req.user.id,
      action: "event_winner_verification_updated",
      event,
      details: {
        verificationStatus,
        adminNotes,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Winner verification updated.",
      winner: {
        event,
        user: event.winner,
        post: event.winningPost,
        totalQualifyingLikes: event.winningLikesCount,
        verificationStatus: event.winnerVerificationStatus,
        adminNotes: event.winnerAdminNotes,
      },
    });
  } catch (error) {
    console.error("Update event winner error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update winner verification.",
    });
  }
};

// ======================================================
// ADMIN: SELECT WINNER MANUALLY
// Used for admin_selected events.
// ======================================================

export const selectEventWinner = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { postId } = req.body;

    if (!isValidId(eventId) || !isValidId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event or post ID.",
      });
    }

    const event = await Event.findOne({
      _id: eventId,
      status: { $in: ["published", "completed"] },
      winningCriteria: "admin_selected",
      winner: null,
      isWinnerLocked: false,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found, already has a winner, or does not allow manual winner selection.",
      });
    }

    const leaderboard = await buildEventLeaderboard(event);

    const selectedEntry = leaderboard.find(
      (entry) => entry.post._id.toString() === postId,
    );

    if (!selectedEntry) {
      return res.status(400).json({
        success: false,
        message: "This post is not an eligible entry for this event.",
      });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: event._id,
        winner: null,
        isWinnerLocked: false,
      },
      {
        $set: {
          winner: selectedEntry.post.author._id || selectedEntry.post.author,
          winningPost: selectedEntry.post._id,
          winnerReachedAt: new Date(),
          winningLikesCount: selectedEntry.likes,
          isWinnerLocked: true,
          winnerVerificationStatus: "pending",
          status: "completed",
        },
      },
      { new: true },
    );

    if (!updatedEvent) {
      return res.status(409).json({
        success: false,
        message: "A winner has already been selected for this event.",
      });
    }

    await writeLeaderboardAudit({
      admin: req.user.id,
      action: "event_winner_selected",
      event: updatedEvent,
      details: {
        postId,
        likes: selectedEntry.likes,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Event winner selected successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Select event winner error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to select event winner.",
    });
  }
};

// ======================================================
// ADMIN: FINALIZE AN EVENT MANUALLY
// ======================================================

export const finalizeEventManually = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const result = await finalizeEvent(eventId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message:
          "This event cannot be finalized yet or requires manual winner selection.",
      });
    }

    await writeLeaderboardAudit({
      admin: req.user.id,
      action: "event_finalized",
      event: result,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Event finalized successfully.",
      event: result,
    });
  } catch (error) {
    console.error("Manual event finalization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to finalize event.",
    });
  }
};

// ======================================================
// TEMPORARY COMPATIBILITY EXPORTS
// These allow the old router and likeController to keep
// importing their existing names until we migrate them.
// They do not use Competition models.
// ======================================================

export const checkCompetitionWinner = checkAutomaticEventWinner;

export const getOrCreateDefaultCompetition = async () => {
  return null;
};

export const finalizeEventCompetition = finalizeEvent;

export const finalizeExpiredCompetitions = finalizeExpiredEvents;

// Old competition registration endpoints are disabled.

const obsoleteCompetitionEndpoint = (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "The separate competition system has been replaced by the Event system.",
  });
};

export const registerCompetitionPost = obsoleteCompetitionEndpoint;
export const withdrawCompetitionPost = obsoleteCompetitionEndpoint;

export const getMyCompetitionEntries = (req, res) => {
  return res.status(200).json({
    success: true,
    entries: [],
    message: "Entries are now managed through Event registrations.",
  });
};

// Old competition management endpoints are disabled.

export const createCompetition = obsoleteCompetitionEndpoint;
export const updateCompetition = obsoleteCompetitionEndpoint;

// Old route name retained temporarily.
// It now returns Events that have leaderboard functionality.
export const getCompetitions = getLeaderboardEvents;
