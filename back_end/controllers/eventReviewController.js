import mongoose from "mongoose";

import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import EventSubmission from "../models/eventSubmissionModel.js";
import EventPaymentReference from "../models/eventPaymentReferenceModel.js";
import AuditLog from "../models/auditLogModel.js";

import { createNotification } from "../services/notificationService.js";

// ==========================================
// HELPERS
// ==========================================

const getAdminId = (req) => req.user.id;

const getEventLink = (event) =>
  event?.slug ? `/events/${event.slug}` : "/events";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const sendEventNotification = async ({
  recipient,
  event,
  title,
  message,
  metadata = {},
}) => {
  await createNotification({
    recipient,
    sender: null,
    type: "event_registration",
    title,
    message,
    link: getEventLink(event),
    event: event?._id || null,
    metadata,
  });
};

const writeAuditLog = async (req, action, targetId, details = {}, session) => {
  await AuditLog.create(
    [
      {
        admin: getAdminId(req),
        action,
        targetType: "event",
        targetId,
        details,
        ipAddress: req.ip || "",
      },
    ],
    { session },
  );
};

// Synchronizes payment, creative approval and registration state.
// This function NEVER creates a public Post.

const syncApprovalState = async (registration, submission, event) => {
  const paymentSatisfied =
    registration.paymentStatus === "not_required" ||
    registration.paymentStatus === "verified";

  const creativeApproved =
    submission.status === "approved" || submission.status === "scheduled";

  // Both requirements must be satisfied.
  if (!paymentSatisfied || !creativeApproved) {
    registration.registrationStatus = "pending_review";

    // A rejected payment must not leave the submission scheduled.
    if (submission.status === "scheduled") {
      submission.status = "approved";
    }

    submission.publishAt = null;

    return;
  }

  registration.registrationStatus = "confirmed";

  // Publish one hour before the event begins.
  const publishAt = new Date(
    new Date(event.startDate).getTime() - 60 * 60 * 1000,
  );

  submission.publishAt = publishAt;

  if (publishAt > new Date()) {
    submission.status = "scheduled";
  } else {
    // The scheduled publication time has already passed.
    // Keep approved so an admin can manually publish it.
    submission.status = "approved";
  }
};

// ==========================================
// ADMIN: GET EVENT REGISTRATIONS FOR REVIEW
// ==========================================

export const getEventRegistrationsForReview = async (req, res) => {
  try {
    const {
      eventId,
      paymentStatus,
      registrationStatus,
      submissionStatus,
      search,
    } = req.query;

    const filter = {};

    // --------------------------------------
    // EVENT FILTER
    // --------------------------------------

    if (eventId) {
      if (!isValidId(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID.",
        });
      }

      filter.event = eventId;
    }

    // --------------------------------------
    // PAYMENT FILTER
    // --------------------------------------

    const validPaymentStatuses = [
      "not_required",
      "pending_verification",
      "verified",
      "rejected",
      "refunded",
    ];

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status.",
        });
      }

      filter.paymentStatus = paymentStatus;
    }

    // --------------------------------------
    // REGISTRATION FILTER
    // --------------------------------------

    const validRegistrationStatuses = [
      "pending_review",
      "confirmed",
      "rejected",
      "waitlist",
      "cancelled",
    ];

    if (registrationStatus) {
      if (!validRegistrationStatuses.includes(registrationStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration status.",
        });
      }

      filter.registrationStatus = registrationStatus;
    }

    // --------------------------------------
    // CREATIVE SUBMISSION FILTER
    // --------------------------------------

    const validSubmissionStatuses = [
      "pending_review",
      "approved",
      "rejected",
      "scheduled",
      "published",
      "withdrawn",
    ];

    if (submissionStatus) {
      if (!validSubmissionStatuses.includes(submissionStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission status.",
        });
      }

      const submissionFilter = {
        status: submissionStatus,
      };

      if (eventId) {
        submissionFilter.event = eventId;
      }

      const matchingRegistrationIds = await EventSubmission.distinct(
        "registration",
        submissionFilter,
      );

      if (matchingRegistrationIds.length === 0) {
        return res.status(200).json({
          success: true,
          registrations: [],
          pagination: {
            page: Math.max(1, Number(req.query.page) || 1),
            limit: Math.min(100, Math.max(1, Number(req.query.limit) || 20)),
            total: 0,
            hasMore: false,
          },
        });
      }

      filter._id = {
        $in: matchingRegistrationIds,
      };
    }

    // --------------------------------------
    // SEARCH FILTER
    // --------------------------------------

    if (typeof search === "string" && search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { fullName: regex },
        { email: regex },
        { paymentReference: regex },
        { registrationNumber: regex },
      ];
    }

    // --------------------------------------
    // PAGINATION
    // --------------------------------------

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
    );

    const skip = (page - 1) * limit;

    // --------------------------------------
    // FETCH RESULTS
    // --------------------------------------

    const [registrations, total] = await Promise.all([
      EventRegistration.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(
          "event",
          "name slug startDate endDate entryFee currency status",
        )
        .populate("user", "name email")
        .populate("submission")
        .lean(),

      EventRegistration.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      registrations,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + registrations.length < total,
      },
    });
  } catch (error) {
    console.error("Get event registrations for review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch event registrations.",
    });
  }
};

// ==========================================
// ADMIN: REVIEW PAYMENT
// ==========================================

export const reviewEventPayment = async (req, res) => {
  const { registrationId } = req.params;

  const { decision, rejectionReason, adminNotes } = req.body;

  // --------------------------------------
  // VALIDATION
  // --------------------------------------

  if (!isValidId(registrationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid registration ID.",
    });
  }

  if (!["verify", "reject"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Decision must be verify or reject.",
    });
  }

  if (decision === "reject" && !isNonEmptyString(rejectionReason)) {
    return res.status(400).json({
      success: false,
      message: "A payment rejection reason is required.",
    });
  }

  if (rejectionReason !== undefined && typeof rejectionReason !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid rejection reason.",
    });
  }

  if (adminNotes !== undefined && typeof adminNotes !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid admin notes.",
    });
  }

  const cleanReason = rejectionReason?.trim() || "";
  const cleanAdminNotes = adminNotes?.trim() || "";

  if (cleanReason.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason cannot exceed 1000 characters.",
    });
  }

  if (cleanAdminNotes.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Admin notes cannot exceed 2000 characters.",
    });
  }

  let session = null;
  let notificationData = null;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      // ----------------------------------
      // FIND REGISTRATION
      // ----------------------------------

      const registration =
        await EventRegistration.findById(registrationId).session(session);

      if (!registration) {
        const error = new Error("Registration not found.");
        error.statusCode = 404;
        throw error;
      }

      if (registration.paymentStatus === "not_required") {
        const error = new Error("This registration does not require payment.");
        error.statusCode = 400;
        throw error;
      }

      if (registration.paymentStatus !== "pending_verification") {
        const error = new Error("This payment is not awaiting verification.");
        error.statusCode = 409;
        throw error;
      }

      if (!registration.paymentReference) {
        const error = new Error(
          "This registration does not have a payment reference.",
        );
        error.statusCode = 409;
        throw error;
      }

      // ----------------------------------
      // FIND ASSOCIATED DOCUMENTS
      // ----------------------------------

      const [event, submission] = await Promise.all([
        Event.findById(registration.event).session(session),
        EventSubmission.findById(registration.submission).session(session),
      ]);

      if (!event || !submission) {
        const error = new Error(
          "Associated event or submission was not found.",
        );
        error.statusCode = 404;
        throw error;
      }

      // ----------------------------------
      // FIND CURRENT PAYMENT REFERENCE
      // ----------------------------------

      const reference = await EventPaymentReference.findOne({
        registration: registration._id,
        reference: registration.paymentReference,
        isCurrent: true,
        status: "submitted",
      }).session(session);

      if (!reference) {
        const error = new Error(
          "Current payment reference ledger entry was not found. Investigate this registration before reviewing it.",
        );
        error.statusCode = 409;
        throw error;
      }

      const now = new Date();
      const adminId = getAdminId(req);

      // ----------------------------------
      // VERIFY PAYMENT
      // ----------------------------------

      if (decision === "verify") {
        registration.paymentStatus = "verified";
        registration.amountPaid = registration.amountDue;
        registration.paymentVerifiedBy = adminId;
        registration.paymentVerifiedAt = now;
        registration.paymentRejectionReason = "";

        reference.status = "verified";
        reference.reviewedAt = now;
        reference.reviewedBy = adminId;
        reference.rejectionReason = "";
      }

      // ----------------------------------
      // REJECT PAYMENT
      // ----------------------------------

      if (decision === "reject") {
        registration.paymentStatus = "rejected";
        registration.amountPaid = 0;
        registration.paymentRejectionReason = cleanReason;

        // Permanently retain this ledger record.
        // It must never become reusable.
        reference.status = "rejected";
        reference.isCurrent = false;
        reference.reviewedAt = now;
        reference.reviewedBy = adminId;
        reference.rejectionReason = cleanReason;
      }

      registration.paymentAdminNotes = cleanAdminNotes;

      await reference.save({ session });

      // Synchronize both approval states on rejection
      // and verification. This also removes stale scheduling.
      await syncApprovalState(registration, submission, event);

      await registration.save({ session });
      await submission.save({ session });

      // ----------------------------------
      // AUDIT LOG INSIDE TRANSACTION
      // ----------------------------------

      await writeAuditLog(
        req,
        decision === "verify"
          ? "event_payment_verified"
          : "event_payment_rejected",
        registration._id,
        {
          eventId: event._id,
          submissionId: submission._id,
          paymentReference: registration.paymentReference,
          paymentStatus: registration.paymentStatus,
          registrationStatus: registration.registrationStatus,
          rejectionReason: decision === "reject" ? cleanReason : "",
          adminNotes: cleanAdminNotes,
        },
        session,
      );

      // ----------------------------------
      // PREPARE NOTIFICATION
      // ----------------------------------

      notificationData = {
        recipient: registration.user,
        event,
        title:
          decision === "verify"
            ? "Payment verified"
            : "Payment verification unsuccessful",

        message:
          decision === "verify"
            ? `Your payment for "${event.name}" has been verified.`
            : `Your payment for "${event.name}" could not be verified. Reason: ${cleanReason}`,

        metadata: {
          registrationId: registration._id.toString(),
          submissionId: submission._id.toString(),
          paymentStatus: registration.paymentStatus,
          registrationStatus: registration.registrationStatus,
          rejectionReason: decision === "reject" ? cleanReason : "",
        },
      };
    });

    // --------------------------------------
    // NOTIFY AFTER TRANSACTION COMMIT
    // --------------------------------------

    if (notificationData) {
      await sendEventNotification(notificationData);
    }

    return res.status(200).json({
      success: true,
      message:
        decision === "verify"
          ? "Payment verified successfully."
          : "Payment rejected. The creator can submit a new payment reference.",
    });
  } catch (error) {
    console.error("Review event payment error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to review event payment.",
    });
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};

// ==========================================
// ADMIN: REVIEW CREATIVE SUBMISSION
// ==========================================

export const reviewEventSubmission = async (req, res) => {
  const { submissionId } = req.params;

  const { decision, rejectionReason, adminNotes } = req.body;

  // --------------------------------------
  // VALIDATION
  // --------------------------------------

  if (!isValidId(submissionId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission ID.",
    });
  }

  if (!["approve", "reject"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Decision must be approve or reject.",
    });
  }

  if (decision === "reject" && !isNonEmptyString(rejectionReason)) {
    return res.status(400).json({
      success: false,
      message: "A creative submission rejection reason is required.",
    });
  }

  if (rejectionReason !== undefined && typeof rejectionReason !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid rejection reason.",
    });
  }

  if (adminNotes !== undefined && typeof adminNotes !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid admin notes.",
    });
  }

  const cleanReason = rejectionReason?.trim() || "";
  const cleanAdminNotes = adminNotes?.trim() || "";

  if (cleanReason.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason cannot exceed 2000 characters.",
    });
  }

  if (cleanAdminNotes.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Admin notes cannot exceed 2000 characters.",
    });
  }

  let session = null;
  let notificationData = null;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      // ----------------------------------
      // FIND SUBMISSION
      // ----------------------------------

      const submission =
        await EventSubmission.findById(submissionId).session(session);

      if (!submission) {
        const error = new Error("Submission not found.");
        error.statusCode = 404;
        throw error;
      }

      if (submission.status !== "pending_review") {
        const error = new Error("This submission is not awaiting review.");
        error.statusCode = 409;
        throw error;
      }

      // ----------------------------------
      // FIND REGISTRATION AND EVENT
      // ----------------------------------

      const [registration, event] = await Promise.all([
        EventRegistration.findById(submission.registration).session(session),

        Event.findById(submission.event).session(session),
      ]);

      if (!registration || !event) {
        const error = new Error(
          "Associated registration or event was not found.",
        );
        error.statusCode = 404;
        throw error;
      }

      if (["cancelled", "completed"].includes(event.status)) {
        const error = new Error(
          "This event is no longer accepting submission reviews.",
        );
        error.statusCode = 409;
        throw error;
      }

      const now = new Date();
      const adminId = getAdminId(req);

      // ----------------------------------
      // APPROVE CREATIVE SUBMISSION
      // ----------------------------------

      if (decision === "approve") {
        submission.status = "approved";
        submission.rejectionReason = "";
        submission.approvedBy = adminId;
        submission.approvedAt = now;

        submission.reviewHistory.push({
          action: "approved",
          reason: "",
          adminNotes: cleanAdminNotes,
          reviewedBy: adminId,
          createdAt: now,
        });

        await syncApprovalState(registration, submission, event);
      }

      // ----------------------------------
      // REJECT CREATIVE SUBMISSION
      // ----------------------------------

      if (decision === "reject") {
        submission.status = "rejected";
        submission.rejectionReason = cleanReason;

        submission.publishAt = null;
        submission.approvedBy = null;
        submission.approvedAt = null;

        // IMPORTANT:
        // Do not reject the whole registration.
        // The creator can correct the submission
        // and resubmit using the same registration.
        registration.registrationStatus = "pending_review";

        submission.reviewHistory.push({
          action: "rejected",
          reason: cleanReason,
          adminNotes: cleanAdminNotes,
          reviewedBy: adminId,
          createdAt: now,
        });
      }

      await submission.save({ session });
      await registration.save({ session });

      // ----------------------------------
      // AUDIT LOG INSIDE TRANSACTION
      // ----------------------------------

      await writeAuditLog(
        req,
        decision === "approve"
          ? "event_submission_approved"
          : "event_submission_rejected",
        submission._id,
        {
          eventId: event._id,
          registrationId: registration._id,
          submissionStatus: submission.status,
          registrationStatus: registration.registrationStatus,
          rejectionReason: decision === "reject" ? cleanReason : "",
          adminNotes: cleanAdminNotes,
          publishAt: submission.publishAt,
        },
        session,
      );

      // ----------------------------------
      // PREPARE NOTIFICATION
      // ----------------------------------

      notificationData = {
        recipient: registration.user,
        event,

        title:
          decision === "approve"
            ? "Your event submission has been approved"
            : "Your event submission needs changes",

        message:
          decision === "approve"
            ? `Your creative submission for "${event.name}" has been approved. Publication will follow the event schedule once payment requirements are satisfied.`
            : `Your submission for "${event.name}" was not approved. Reason: ${cleanReason}`,

        metadata: {
          registrationId: registration._id.toString(),
          submissionId: submission._id.toString(),
          submissionStatus: submission.status,
          registrationStatus: registration.registrationStatus,
          rejectionReason: decision === "reject" ? cleanReason : "",
        },
      };
    });

    // --------------------------------------
    // NOTIFY AFTER TRANSACTION COMMIT
    // --------------------------------------

    if (notificationData) {
      await sendEventNotification(notificationData);
    }

    return res.status(200).json({
      success: true,
      message:
        decision === "approve"
          ? "Creative submission approved successfully."
          : "Creative submission rejected. The creator can correct and resubmit it.",
    });
  } catch (error) {
    console.error("Review event submission error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to review event submission.",
    });
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};
