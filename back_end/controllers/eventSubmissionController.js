import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { randomBytes } from "crypto";

import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import EventSubmission from "../models/eventSubmissionModel.js";
import EventPaymentReference from "../models/eventPaymentReferenceModel.js";
import Profile from "../models/profileModel.js";

import { createNotification } from "../services/notificationService.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================================================
// CONSTANTS
// ======================================================

const categories = ["voice", "vision", "art", "words"];

const fontStyles = ["serif", "sans", "devanagari", "handwritten"];

const textAlignments = ["left", "center", "right"];

const paymentMethods = [
  "esewa",
  "khalti",
  "bank_transfer",
  "card_gateway",
  "cash",
];

// ======================================================
// HELPERS
// ======================================================

const isOptionalString = (value) =>
  value === undefined || typeof value === "string";

const generateRegistrationNumber = () =>
  `PR-${Date.now().toString(36).toUpperCase()}-${randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

const parseTags = (tags) => {
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

const getMediaType = (mimetype = "") => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  return null;
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

        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("CLOUDINARY_UPLOAD_FAILED"));
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

const deleteUploadedMedia = async (uploadedMedia, mediaType) => {
  if (!uploadedMedia?.public_id) return;

  const resourceType = mediaType === "image" ? "image" : "video";

  try {
    await cloudinary.uploader.destroy(uploadedMedia.public_id, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Event submission media cleanup error:", error);
  }
};

const notifyRegistrationSubmitted = async ({
  userId,
  event,
  registration,
  isPaidEvent,
}) => {
  try {
    await createNotification({
      recipient: userId,
      sender: null,
      type: "event_registration",
      title: "Event Entry Submitted",
      message: isPaidEvent
        ? `Your entry for "${event.name}" has been submitted. Payment and creative review are pending.`
        : `Your entry for "${event.name}" has been submitted and is awaiting creative review.`,
      link: "/events",
      event: event._id,
      metadata: {
        eventId: event._id,
        eventName: event.name,
        registrationId: registration._id,
        registrationNumber: registration.registrationNumber,
      },
    });
  } catch (error) {
    console.error("Event registration notification error:", error);
  }
};

// ======================================================
// SUBMIT EVENT ENTRY
// ONE REGISTRATION = ONE CREATIVE SUBMISSION
// ======================================================

export const submitEventEntry = async (req, res) => {
  let uploadedMedia = null;
  let uploadedMediaType = null;
  let session = null;

  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const {
      fullName,
      email,
      phone,
      notes,
      portfolioOrLink,
      category,
      title,
      description,
      content,
      tags,
      fontStyle,
      textAlign,
      paymentMethod,
      paymentReference,
    } = req.body;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }

    if (fullName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Full name cannot exceed 100 characters.",
      });
    }

    if (email.trim().length > 254) {
      return res.status(400).json({
        success: false,
        message: "Email address is too long.",
      });
    }

    if (
      !isOptionalString(phone) ||
      !isOptionalString(notes) ||
      !isOptionalString(portfolioOrLink) ||
      !isOptionalString(title) ||
      !isOptionalString(description) ||
      !isOptionalString(content) ||
      !isOptionalString(paymentMethod) ||
      !isOptionalString(paymentReference)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration or submission details.",
      });
    }

    if (phone && phone.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: "Phone number cannot exceed 30 characters.",
      });
    }

    if (notes && notes.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 1000 characters.",
      });
    }

    if (portfolioOrLink && portfolioOrLink.trim().length > 2048) {
      return res.status(400).json({
        success: false,
        message: "Portfolio link is too long.",
      });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid Manch.",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Submission title is required.",
      });
    }

    if (title.trim().length > 100) {
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

    // ==================================================
    // LOAD EVENT AND PROFILE
    // ==================================================

    const [event, profile] = await Promise.all([
      Event.findById(eventId).lean(),
      Profile.findOne({ user: userId }).lean(),
    ]);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Create your PRATIVA profile before registering.",
      });
    }

    if (event.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This event is not accepting registrations.",
      });
    }

    const now = new Date();

    // ==================================================
    // REGISTRATION WINDOW
    // ==================================================

    if (
      event.registrationStartDate &&
      now < new Date(event.registrationStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration for this event has not started.",
      });
    }

    if (
      !event.registrationEndDate ||
      now > new Date(event.registrationEndDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration for this event has closed.",
      });
    }

    if (!event.startDate || now >= new Date(event.startDate)) {
      return res.status(400).json({
        success: false,
        message: "This event has already started.",
      });
    }

    // ==================================================
    // CATEGORY ELIGIBILITY
    // ==================================================

    if (event.category !== "all" && event.category !== category) {
      return res.status(400).json({
        success: false,
        message: "This Manch is not eligible for this event.",
      });
    }

    // ==================================================
    // CREATIVE SUBMISSION VALIDATION
    // ==================================================

    let media = undefined;
    let mediaType = null;

    if (category === "words") {
      if (req.file) {
        return res.status(400).json({
          success: false,
          message: "Words submissions do not support file uploads.",
        });
      }

      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Please write something before submitting.",
        });
      }

      if (content.length > 10000) {
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
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload your creative work.",
        });
      }

      mediaType = getMediaType(req.file.mimetype);

      if (!mediaType) {
        return res.status(400).json({
          success: false,
          message: "Only images and audio files are allowed.",
        });
      }

      if (category === "voice" && mediaType !== "audio") {
        return res.status(400).json({
          success: false,
          message: "Swar submissions must contain audio.",
        });
      }

      if (["vision", "art"].includes(category) && mediaType !== "image") {
        return res.status(400).json({
          success: false,
          message: "This Manch accepts image submissions only.",
        });
      }
    }

    // ==================================================
    // PAYMENT VALIDATION
    // PER ENTRY, NOT PER USER OR EVENT
    // ==================================================

    const amountDue = Number(event.entryFee) || 0;
    const isPaidEvent = amountDue > 0;

    let normalizedReference = "";
    let normalizedPaymentMethod = "none";

    if (isPaidEvent) {
      if (typeof paymentReference !== "string" || !paymentReference.trim()) {
        return res.status(400).json({
          success: false,
          message: "A payment transaction reference is required.",
        });
      }

      normalizedReference = paymentReference.trim().toUpperCase();

      if (normalizedReference.length > 150) {
        return res.status(400).json({
          success: false,
          message: "Transaction reference is too long.",
        });
      }

      if (!paymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid payment method.",
        });
      }

      normalizedPaymentMethod = paymentMethod;
    } else if (
      (paymentReference && paymentReference.trim()) ||
      (paymentMethod && paymentMethod !== "none")
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are not required for a free event.",
      });
    }

    // ==================================================
    // PRE-CHECK DUPLICATE PAYMENT REFERENCE
    // GLOBAL ACROSS EVENT REGISTRATIONS
    // ==================================================

    if (normalizedReference) {
      const referenceExists = await EventPaymentReference.exists({
        reference: normalizedReference,
      });

      if (referenceExists) {
        return res.status(409).json({
          success: false,
          message:
            "This transaction reference has already been submitted. Please enter a different reference.",
        });
      }
    }

    // ==================================================
    // UPLOAD MEDIA ONLY AFTER VALIDATION
    // ==================================================

    if (category !== "words") {
      uploadedMediaType = mediaType;

      uploadedMedia = await uploadEventSubmissionMedia(
        req.file,
        category,
        mediaType,
      );

      media = {
        type: mediaType,
        url: uploadedMedia.secure_url,
        publicId: uploadedMedia.public_id,
        thumbnail: "",
        duration: uploadedMedia.duration || 0,
      };
    }

    // ==================================================
    // PREPARE DOCUMENTS
    // ==================================================

    const registrationId = new mongoose.Types.ObjectId();
    const submissionId = new mongoose.Types.ObjectId();

    const registrationNumber = generateRegistrationNumber();

    session = await mongoose.startSession();

    let registration;
    let submission;
    let reservedEvent;

    // ==================================================
    // ATOMIC DATABASE TRANSACTION
    // ==================================================

    await session.withTransaction(async () => {
      // The event must still be open and have available capacity.
      // The seat reservation and document creation happen together.

      reservedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          status: "published",

          registrationStartDate: { $lte: now },
          registrationEndDate: { $gte: now },

          startDate: { $gt: now },

          $expr: {
            $or: [
              { $eq: ["$maxParticipants", 0] },
              {
                $lt: [
                  {
                    $ifNull: ["$reservedParticipants", 0],
                  },
                  "$maxParticipants",
                ],
              },
            ],
          },
        },
        {
          $inc: {
            reservedParticipants: 1,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!reservedEvent) {
        throw new Error("EVENT_CLOSED_OR_CAPACITY_FULL");
      }

      if (
        reservedEvent.category !== "all" &&
        reservedEvent.category !== category
      ) {
        throw new Error("EVENT_CATEGORY_NOT_ALLOWED");
      }

      const submissionData = {
        _id: submissionId,
        event: reservedEvent._id,
        registration: registrationId,
        user: userId,

        category,
        title: title.trim(),
        description: description?.trim() || "",
        content: category === "words" ? content.trim() : "",

        media,

        fontStyle: category === "words" ? fontStyle || "serif" : undefined,

        textAlign: category === "words" ? textAlign || "left" : undefined,

        tags: parseTags(tags),

        status: "pending_review",
      };

      const registrationData = {
        _id: registrationId,
        event: reservedEvent._id,
        user: userId,
        submission: submissionId,

        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
        notes: notes?.trim() || "",
        portfolioOrLink: portfolioOrLink?.trim() || "",

        paymentStatus: isPaidEvent ? "pending_verification" : "not_required",

        paymentMethod: normalizedPaymentMethod,

        ...(normalizedReference
          ? { paymentReference: normalizedReference }
          : {}),

        amountDue,
        amountPaid: 0,
        currency: reservedEvent.currency || "NPR",

        registrationStatus: "pending_review",
        reservesSeat: true,
        registrationNumber,
      };

      [submission] = await EventSubmission.create([submissionData], {
        session,
      });

      [registration] = await EventRegistration.create([registrationData], {
        session,
      });

      // The unique reference index is the final protection
      // against simultaneous duplicate transaction submissions.

      if (normalizedReference) {
        await EventPaymentReference.create(
          [
            {
              reference: normalizedReference,
              registration: registration._id,
              event: reservedEvent._id,
              user: userId,
              status: "submitted",
              isCurrent: true,
              submittedAt: now,
            },
          ],
          { session },
        );
      }
    });

    await session.endSession();
    session = null;

    // ==================================================
    // NOTIFICATION AFTER SUCCESSFUL COMMIT
    // ==================================================

    await notifyRegistrationSubmitted({
      userId,
      event: reservedEvent,
      registration,
      isPaidEvent,
    });

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message: isPaidEvent
        ? "Your event entry has been submitted. Payment and creative work are awaiting admin verification."
        : "Your event entry has been submitted for admin review.",

      registration: {
        _id: registration._id,
        registrationNumber: registration.registrationNumber,
        event: registration.event,
        paymentStatus: registration.paymentStatus,
        registrationStatus: registration.registrationStatus,
        amountDue: registration.amountDue,
        amountPaid: registration.amountPaid,
        currency: registration.currency,
      },

      submission: {
        _id: submission._id,
        category: submission.category,
        title: submission.title,
        status: submission.status,
      },
    });
  } catch (error) {
    // ==================================================
    // CLOUDINARY CLEANUP
    // ==================================================

    await deleteUploadedMedia(uploadedMedia, uploadedMediaType);

    // ==================================================
    // DUPLICATE INDEX ERRORS
    // ==================================================

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (
        duplicateField === "reference" ||
        duplicateField === "paymentReference"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This transaction reference has already been submitted. Please enter a different reference.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "A duplicate registration or submission was detected.",
      });
    }

    // ==================================================
    // BUSINESS RULE ERRORS
    // ==================================================

    if (error.message === "EVENT_CLOSED_OR_CAPACITY_FULL") {
      return res.status(400).json({
        success: false,
        message: "Registration is closed or the event is full.",
      });
    }

    if (error.message === "EVENT_CATEGORY_NOT_ALLOWED") {
      return res.status(400).json({
        success: false,
        message: "This Manch is not eligible for this event.",
      });
    }

    if (error.message === "CLOUDINARY_UPLOAD_FAILED") {
      return res.status(500).json({
        success: false,
        message: "Unable to upload your creative work. Please try again.",
      });
    }

    console.error("Submit event entry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your event entry.",
    });
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};
