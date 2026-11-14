import mongoose from "mongoose";

import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import EventSubmission from "../models/eventSubmissionModel.js";
import Post from "../models/postModel.js";

import { createNotification } from "./notificationService.js";
import { finalizeExpiredEvents } from "../controllers/leaderboardController.js";

// Check scheduled tasks every 15 seconds.
const SCHEDULER_INTERVAL = 15 * 1000;

let schedulerInterval = null;
let isRunning = false;

// ==========================================
// PUBLISH ONE EVENT SUBMISSION
// ==========================================

const publishSubmission = async (submissionId) => {
  let session = null;
  let notificationData = null;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const now = new Date();

      // --------------------------------------
      // FETCH SUBMISSION
      // --------------------------------------

      const submission =
        await EventSubmission.findById(submissionId).session(session);

      if (!submission) return;

      // Never publish twice.
      if (submission.publishedPost) return;

      // Only approved or scheduled submissions can publish.
      if (!["scheduled", "approved"].includes(submission.status)) {
        return;
      }

      if (!submission.publishAt || submission.publishAt > now) {
        return;
      }

      // --------------------------------------
      // FETCH EVENT AND REGISTRATION
      // --------------------------------------

      const [event, registration] = await Promise.all([
        Event.findById(submission.event).session(session),

        EventRegistration.findById(submission.registration).session(session),
      ]);

      if (!event || !registration) return;

      // Only published registration-based Events can publish submissions.
      if (
        event.status !== "published" ||
        event.participationMode !== "registration"
      ) {
        return;
      }

      // Do not publish after the Event has started.
      if (new Date(event.startDate) <= now) return;

      // --------------------------------------
      // VERIFY REGISTRATION
      // --------------------------------------

      if (registration.registrationStatus !== "confirmed") {
        return;
      }

      const paymentSatisfied =
        registration.paymentStatus === "not_required" ||
        registration.paymentStatus === "verified";

      if (!paymentSatisfied) return;

      // Confirm this registration belongs to this submission.
      if (registration.submission.toString() !== submission._id.toString()) {
        return;
      }

      // --------------------------------------
      // CREATE NORMAL PRATIVA POST
      // --------------------------------------

      const postId = new mongoose.Types.ObjectId();

      const postData = {
        _id: postId,

        author: submission.user,
        category: submission.category,

        title: submission.title || "",
        description: submission.description || "",
        content: submission.content || "",

        // Reuse existing Cloudinary media.
        // No second upload is necessary.
        media: submission.media
          ? {
              type: submission.media.type,
              url: submission.media.url,
              publicId: submission.media.publicId,
              thumbnail: submission.media.thumbnail || "",
              duration: submission.media.duration || 0,
            }
          : undefined,

        fontStyle:
          submission.category === "words"
            ? submission.fontStyle || "serif"
            : undefined,

        textAlign:
          submission.category === "words"
            ? submission.textAlign || "left"
            : undefined,

        tags: submission.tags || [],
      };

      const [post] = await Post.create([postData], { session });

      // --------------------------------------
      // MARK SUBMISSION AS PUBLISHED
      // --------------------------------------

      submission.status = "published";
      submission.publishedPost = post._id;
      submission.publishedAt = now;

      submission.reviewHistory.push({
        action: "published",
        reason: "Automatically published according to the event schedule.",
        createdAt: now,
      });

      await submission.save({ session });

      notificationData = {
        recipient: submission.user,
        event,
        postId: post._id,
        eventName: event.name,
      };
    });

    // --------------------------------------
    // NOTIFY AFTER TRANSACTION COMMIT
    // --------------------------------------

    if (notificationData) {
      await createNotification({
        recipient: notificationData.recipient,
        sender: null,
        type: "event_registration",
        title: "Your event submission is now published",
        message: `Your approved submission for "${notificationData.eventName}" is now published on PRATIVA.`,
        link: `/post/${notificationData.postId}`,
        event: notificationData.event._id,
        post: notificationData.postId,
        metadata: {
          submissionId: submissionId.toString(),
          postId: notificationData.postId.toString(),
          publicationType: "automatic_event_publication",
        },
      });

      console.log(`[Event Publisher] Published submission ${submissionId}`);
    }
  } catch (error) {
    console.error(
      `[Event Publisher] Failed to publish submission ${submissionId}:`,
      error,
    );
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};

// ==========================================
// CHECK DUE SUBMISSIONS
// ==========================================

const processDueSubmissions = async () => {
  try {
    const now = new Date();

    const dueSubmissions = await EventSubmission.find({
      status: { $in: ["scheduled", "approved"] },
      publishAt: { $ne: null, $lte: now },
      publishedPost: null,
    })
      .select("_id")
      .limit(100)
      .lean();

    for (const submission of dueSubmissions) {
      await publishSubmission(submission._id);
    }
  } catch (error) {
    console.error("[Event Publisher] Publication scheduler error:", error);
  }
};

// ==========================================
// FINALIZE EXPIRED EVENTS
// ==========================================

const processExpiredEvents = async () => {
  try {
    const finalizedEvents = await finalizeExpiredEvents();

    if (finalizedEvents?.length) {
      console.log(
        `[Event Publisher] Finalized ${finalizedEvents.length} expired Event(s).`,
      );
    }
  } catch (error) {
    console.error("[Event Publisher] Event finalization error:", error);
  }
};

// ==========================================
// RUN ALL SCHEDULED TASKS
// ==========================================

const processScheduledTasks = async () => {
  if (isRunning) return;

  isRunning = true;

  try {
    // Publish approved submissions whose publication time has arrived.
    await processDueSubmissions();

    // Finalize Events whose deadlines have passed.
    await processExpiredEvents();
  } catch (error) {
    console.error("[Event Publisher] Scheduler error:", error);
  } finally {
    isRunning = false;
  }
};

// ==========================================
// START EVENT SCHEDULER
// ==========================================

export const startEventPublicationScheduler = () => {
  if (schedulerInterval) {
    console.log("[Event Publisher] Scheduler is already running.");
    return;
  }

  console.log(
    "[Event Publisher] Publication and Event finalization scheduler started.",
  );

  // Run once immediately when the server starts.
  processScheduledTasks();

  schedulerInterval = setInterval(processScheduledTasks, SCHEDULER_INTERVAL);

  // Do not keep the Node process alive solely for this timer.
  schedulerInterval.unref?.();
};
