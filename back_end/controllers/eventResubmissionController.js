import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import EventSubmission from "../models/eventSubmissionModel.js";
import EventPaymentReference from "../models/eventPaymentReferenceModel.js";

import { createNotification } from "../services/notificationService.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// CONSTANTS
// ==========================================

const fontStyles = ["serif", "sans", "devanagari", "handwritten"];
const textAlignments = ["left", "center", "right"];

const paymentMethods = [
  "esewa",
  "khalti",
  "bank_transfer",
  "card_gateway",
  "cash",
];

// ==========================================
// HELPERS
// ==========================================

const getMediaType = (mimetype = "") => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  return null;
};

const isOptionalString = (value) =>
  value === undefined || typeof value === "string";

const parseTags = (tags) => {
  if (tags === undefined) return undefined;
  if (!tags) return [];

  let values = [];

  if (Array.isArray(tags)) {
    values = tags;
  } else if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      values = Array.isArray(parsed) ? parsed : tags.split(",");
    } catch {
      values = tags.split(",");
    }
  }

  return [
    ...new Set(
      values
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 30)),
    ),
  ].slice(0, 10);
};

const uploadEventSubmissionMedia = (file, category, mediaType) => {
  return new Promise((resolve, reject) => {
    const resourceType = mediaType === "image" ? "image" : "video";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `prativa/events/submissions/${category}`,
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

const deleteCloudinaryMedia = async (media) => {
  if (!media?.publicId) return;

  const resourceType = media.type === "image" ? "image" : "video";

  try {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Event media deletion error:", error);
  }
};

const sendResubmissionNotification = async ({
  recipient,
  event,
  registration,
  paymentUpdated,
  creativeUpdated,
}) => {
  try {
    const changes = [];

    if (creativeUpdated) changes.push("creative submission");
    if (paymentUpdated) changes.push("payment reference");

    await createNotification({
      recipient,
      sender: null,
      type: "event_registration",
      title: "Event Entry Resubmitted",
      message: `Your ${changes.join(" and ")} for "${event.name}" has been resubmitted and is awaiting the required admin review.`,
      link: event.slug ? `/events/${event.slug}` : "/events",
      event: event._id,
      metadata: {
        eventId: event._id,
        registrationId: registration._id,
        registrationNumber: registration.registrationNumber,
        submissionId: registration.submission,
        paymentUpdated,
        creativeUpdated,
      },
    });
  } catch (error) {
    console.error("Resubmission notification error:", error);
  }
};

// ==========================================
// RESUBMIT EVENT ENTRY
// ==========================================

export const resubmitEventEntry = async (req, res) => {
  let session = null;

  let uploadedMedia = null;
  let uploadedMediaType = null;
  let oldMediaToDelete = null;
  let notificationData = null;

  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID.",
      });
    }

    // ======================================
    // FIND REGISTRATION
    // ======================================

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      user: userId,
    }).lean();

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    if (registration.registrationStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled registrations cannot be resubmitted.",
      });
    }

    // ======================================
    // FIND EVENT AND SUBMISSION
    // ======================================

    const [event, submission] = await Promise.all([
      Event.findById(registration.event).lean(),
      EventSubmission.findById(registration.submission).lean(),
    ]);

    if (!event || !submission) {
      return res.status(404).json({
        success: false,
        message: "Associated event or submission was not found.",
      });
    }

    if (submission.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify another creator's submission.",
      });
    }

    // ======================================
    // DETERMINE WHAT NEEDS RESUBMISSION
    // ======================================

    const creativeRejected = submission.status === "rejected";
    const paymentRejected = registration.paymentStatus === "rejected";

    if (!creativeRejected && !paymentRejected) {
      return res.status(400).json({
        success: false,
        message: "This entry does not currently require resubmission.",
      });
    }

    if (event.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This event is not accepting resubmissions.",
      });
    }

    const now = new Date();

    if (
      !event.registrationEndDate ||
      now > new Date(event.registrationEndDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "The resubmission deadline has passed.",
      });
    }

    if (!event.startDate || now >= new Date(event.startDate)) {
      return res.status(400).json({
        success: false,
        message: "This event has already started.",
      });
    }

    // ======================================
    // VALIDATE CREATIVE CORRECTIONS
    // ======================================

    let newMedia = undefined;

    if (creativeRejected) {
      const { title, description, content, tags, fontStyle, textAlign } =
        req.body;

      if (
        !isOptionalString(title) ||
        !isOptionalString(description) ||
        !isOptionalString(content)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid creative submission details.",
        });
      }

      const updatedTitle =
        title !== undefined ? title.trim() : submission.title;

      const updatedDescription =
        description !== undefined ? description.trim() : submission.description;

      const updatedContent =
        content !== undefined ? content : submission.content;

      if (!updatedTitle) {
        return res.status(400).json({
          success: false,
          message: "Submission title is required.",
        });
      }

      if (updatedTitle.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Title cannot exceed 100 characters.",
        });
      }

      if (updatedDescription.length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 2000 characters.",
        });
      }

      if (submission.category === "words") {
        if (req.file) {
          return res.status(400).json({
            success: false,
            message: "Words submissions do not support file uploads.",
          });
        }

        if (typeof updatedContent !== "string" || !updatedContent.trim()) {
          return res.status(400).json({
            success: false,
            message: "Written content is required.",
          });
        }

        if (updatedContent.length > 10000) {
          return res.status(400).json({
            success: false,
            message: "Content cannot exceed 10000 characters.",
          });
        }

        if (fontStyle !== undefined && !fontStyles.includes(fontStyle)) {
          return res.status(400).json({
            success: false,
            message: "Invalid font style.",
          });
        }

        if (textAlign !== undefined && !textAlignments.includes(textAlign)) {
          return res.status(400).json({
            success: false,
            message: "Invalid text alignment.",
          });
        }
      } else {
        if (req.file) {
          const mediaType = getMediaType(req.file.mimetype);

          if (!mediaType) {
            return res.status(400).json({
              success: false,
              message: "Only image and audio files are allowed.",
            });
          }

          if (submission.category === "voice" && mediaType !== "audio") {
            return res.status(400).json({
              success: false,
              message: "Swar submissions must contain audio.",
            });
          }

          if (
            ["vision", "art"].includes(submission.category) &&
            mediaType !== "image"
          ) {
            return res.status(400).json({
              success: false,
              message: "This Manch accepts image submissions only.",
            });
          }

          uploadedMediaType = mediaType;

          newMedia = {
            type: mediaType,
          };
        } else if (!submission.media?.url) {
          return res.status(400).json({
            success: false,
            message: "Please upload your creative work.",
          });
        }
      }

      if (newMedia && submission.media?.publicId) {
        oldMediaToDelete = submission.media;
      }
    } else if (req.file) {
      return res.status(400).json({
        success: false,
        message: "Creative work does not need correction.",
      });
    }

    // ======================================
    // VALIDATE REPLACEMENT PAYMENT
    // Do this BEFORE uploading media.
    // ======================================

    let normalizedReference = "";
    let normalizedPaymentMethod = "";

    if (paymentRejected) {
      const { paymentReference, paymentMethod } = req.body;

      if (typeof paymentReference !== "string" || !paymentReference.trim()) {
        return res.status(400).json({
          success: false,
          message: "A new payment reference is required.",
        });
      }

      normalizedReference = paymentReference.trim().toUpperCase();

      if (normalizedReference.length > 150) {
        return res.status(400).json({
          success: false,
          message: "Payment reference cannot exceed 150 characters.",
        });
      }

      if (!paymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid payment method.",
        });
      }

      normalizedPaymentMethod = paymentMethod;

      const referenceExists = await EventPaymentReference.exists({
        reference: normalizedReference,
      });

      if (referenceExists) {
        return res.status(409).json({
          success: false,
          message:
            "This transaction reference has already been used. Please enter a different reference.",
        });
      }
    } else if (req.body.paymentReference || req.body.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Your payment does not need to be resubmitted.",
      });
    }

    // ======================================
    // UPLOAD REPLACEMENT MEDIA
    // Only after all early validations pass.
    // ======================================

    if (newMedia && req.file) {
      uploadedMedia = await uploadEventSubmissionMedia(
        req.file,
        submission.category,
        uploadedMediaType,
      );

      if (!uploadedMedia?.secure_url || !uploadedMedia?.public_id) {
        throw new Error("MEDIA_UPLOAD_FAILED");
      }

      newMedia = {
        type: uploadedMediaType,
        url: uploadedMedia.secure_url,
        publicId: uploadedMedia.public_id,
        thumbnail: "",
        duration: uploadedMedia.duration || 0,
      };
    }

    // ======================================
    // START TRANSACTION
    // ======================================

    session = await mongoose.startSession();

    let updatedRegistration;
    let updatedSubmission;

    await session.withTransaction(async () => {
      updatedRegistration = await EventRegistration.findOne({
        _id: registrationId,
        user: userId,
      }).session(session);

      updatedSubmission = await EventSubmission.findOne({
        _id: registration.submission,
        registration: registrationId,
        user: userId,
      }).session(session);

      const currentEvent = await Event.findById(registration.event).session(
        session,
      );

      if (!updatedRegistration || !updatedSubmission || !currentEvent) {
        throw new Error("RESUBMISSION_RECORD_NOT_FOUND");
      }

      // Use fresh time inside the transaction.
      const transactionNow = new Date();

      if (
        currentEvent.status !== "published" ||
        !currentEvent.registrationEndDate ||
        transactionNow > new Date(currentEvent.registrationEndDate) ||
        !currentEvent.startDate ||
        transactionNow >= new Date(currentEvent.startDate)
      ) {
        throw new Error("RESUBMISSION_WINDOW_CLOSED");
      }

      if (creativeRejected && updatedSubmission.status !== "rejected") {
        throw new Error("CREATIVE_STATUS_CHANGED");
      }

      if (paymentRejected && updatedRegistration.paymentStatus !== "rejected") {
        throw new Error("PAYMENT_STATUS_CHANGED");
      }

      // ====================================
      // UPDATE CREATIVE SUBMISSION
      // ====================================

      if (creativeRejected) {
        const { title, description, content, tags, fontStyle, textAlign } =
          req.body;

        if (title !== undefined) {
          updatedSubmission.title = title.trim();
        }

        if (description !== undefined) {
          updatedSubmission.description = description.trim();
        }

        if (updatedSubmission.category === "words") {
          if (content !== undefined) {
            updatedSubmission.content = content.trim();
          }

          if (fontStyle !== undefined) {
            updatedSubmission.fontStyle = fontStyle;
          }

          if (textAlign !== undefined) {
            updatedSubmission.textAlign = textAlign;
          }
        }

        if (tags !== undefined) {
          updatedSubmission.tags = parseTags(tags);
        }

        if (newMedia) {
          updatedSubmission.media = newMedia;
        }

        updatedSubmission.status = "pending_review";
        updatedSubmission.rejectionReason = "";
        updatedSubmission.publishAt = null;
        updatedSubmission.publishedAt = null;
        updatedSubmission.approvedBy = null;
        updatedSubmission.approvedAt = null;

        updatedSubmission.revisionCount =
          (updatedSubmission.revisionCount || 0) + 1;

        updatedSubmission.lastResubmittedAt = transactionNow;

        updatedSubmission.reviewHistory.push({
          action: "resubmitted",
          reason: "",
          adminNotes: "",
          reviewedBy: null,
          createdAt: transactionNow,
        });
      }

      // ====================================
      // UPDATE PAYMENT REFERENCE
      // ====================================

      if (paymentRejected) {
        const oldReference = updatedRegistration.paymentReference;

        const oldLedger = await EventPaymentReference.findOne({
          registration: updatedRegistration._id,
          reference: oldReference,
          status: "rejected",
          isCurrent: false,
        }).session(session);

        if (!oldLedger) {
          throw new Error("OLD_PAYMENT_REFERENCE_NOT_FOUND");
        }

        updatedRegistration.paymentReference = normalizedReference;
        updatedRegistration.paymentMethod = normalizedPaymentMethod;
        updatedRegistration.paymentStatus = "pending_verification";
        updatedRegistration.paymentRejectionReason = "";
        updatedRegistration.paymentVerifiedBy = null;
        updatedRegistration.paymentVerifiedAt = null;
        updatedRegistration.amountPaid = 0;
        updatedRegistration.paymentAdminNotes = "";

        await EventPaymentReference.create(
          [
            {
              reference: normalizedReference,
              registration: updatedRegistration._id,
              event: updatedRegistration.event,
              user: updatedRegistration.user,
              status: "submitted",
              isCurrent: true,
              submittedAt: transactionNow,
            },
          ],
          { session },
        );
      }

      // ====================================
      // UPDATE REGISTRATION STATUS
      // ====================================

      updatedRegistration.registrationStatus = "pending_review";

      await updatedSubmission.save({ session });
      await updatedRegistration.save({ session });

      // ====================================
      // PREPARE NOTIFICATION
      // ====================================

      notificationData = {
        recipient: updatedRegistration.user,
        event: currentEvent,
        registration: updatedRegistration,
        paymentUpdated: paymentRejected,
        creativeUpdated: creativeRejected,
      };
    });

    // ======================================
    // CLEAN UP OLD MEDIA AFTER COMMIT
    // ======================================

    if (oldMediaToDelete) {
      await deleteCloudinaryMedia(oldMediaToDelete);
    }

    // ======================================
    // NOTIFICATION
    // ======================================

    if (notificationData) {
      await sendResubmissionNotification(notificationData);
    }

    return res.status(200).json({
      success: true,
      message: "Your event entry has been resubmitted successfully.",
      registration: {
        _id: updatedRegistration._id,
        registrationNumber: updatedRegistration.registrationNumber,
        paymentStatus: updatedRegistration.paymentStatus,
        registrationStatus: updatedRegistration.registrationStatus,
      },
      submission: {
        _id: updatedSubmission._id,
        title: updatedSubmission.title,
        status: updatedSubmission.status,
        revisionCount: updatedSubmission.revisionCount,
      },
    });
  } catch (error) {
    // ======================================
    // CLEAN UP NEW UPLOAD IF TRANSACTION FAILS
    // ======================================

    if (uploadedMedia?.public_id) {
      await deleteCloudinaryMedia({
        publicId: uploadedMedia.public_id,
        type: uploadedMediaType,
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This payment reference has already been used. Please enter another reference.",
      });
    }

    if (error.message === "RESUBMISSION_RECORD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Registration or submission was not found.",
      });
    }

    if (error.message === "RESUBMISSION_WINDOW_CLOSED") {
      return res.status(400).json({
        success: false,
        message: "The resubmission deadline has passed.",
      });
    }

    if (error.message === "CREATIVE_STATUS_CHANGED") {
      return res.status(409).json({
        success: false,
        message:
          "The creative submission status has changed. Refresh and try again.",
      });
    }

    if (error.message === "PAYMENT_STATUS_CHANGED") {
      return res.status(409).json({
        success: false,
        message: "The payment status has changed. Refresh and try again.",
      });
    }

    if (error.message === "OLD_PAYMENT_REFERENCE_NOT_FOUND") {
      return res.status(409).json({
        success: false,
        message:
          "The previous payment reference could not be verified in the ledger. Please contact the administrator.",
      });
    }

    if (error.message === "MEDIA_UPLOAD_FAILED") {
      return res.status(500).json({
        success: false,
        message: "The media upload failed. Please try again.",
      });
    }

    console.error("Event entry resubmission error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resubmit your event entry.",
    });
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};
