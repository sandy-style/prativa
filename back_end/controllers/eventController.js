import mongoose from "mongoose";
import { randomBytes } from "crypto";

import Event from "../models/eventModel.js";
import EventRegistration from "../models/eventRegistrationModel.js";
import EventSubmission from "../models/eventSubmissionModel.js";
import EventPaymentReference from "../models/eventPaymentReferenceModel.js";
import AuditLog from "../models/auditLogModel.js";

import { cloudinary } from "../configs/cloudinary.js";
import { createNotification } from "../services/notificationService.js";

// ======================================================
// CONSTANTS
// ======================================================

const categories = ["voice", "vision", "art", "words"];

const paymentMethods = [
  "esewa",
  "khalti",
  "bank_transfer",
  "card_gateway",
  "cash",
];

const participationModes = ["registration", "automatic"];

const winningCriteriaOptions = [
  "none",
  "highest_likes",
  "first_to_likes",
  "admin_selected",
];

// ======================================================
// HELPERS
// ======================================================

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") return value;

  return String(value).toLowerCase() === "true";
};

const parseTags = (value) => {
  let tags = [];

  if (Array.isArray(value)) {
    tags = value;
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      tags = Array.isArray(parsed) ? parsed : value.split(",");
    } catch {
      tags = value.split(",");
    }
  }

  return [
    ...new Set(
      tags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 30)),
    ),
  ].slice(0, 10);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateRegistrationNumber = () =>
  `PR-${Date.now().toString(36).toUpperCase()}-${randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

const uploadEventBanner = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "prativa/events",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

const uploadEventSubmissionMedia = (file, category) => {
  return new Promise((resolve, reject) => {
    const mediaType = file.mimetype.startsWith("image/")
      ? "image"
      : file.mimetype.startsWith("audio/")
        ? "audio"
        : null;

    if (!mediaType) {
      return reject(new Error("Unsupported media type."));
    }

    const resourceType = mediaType === "image" ? "image" : "video";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `prativa/events/submissions/${category}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          type: mediaType,
          url: result.secure_url,
          publicId: result.public_id,
          thumbnail: "",
          duration: result.duration || 0,
        });
      },
    );

    stream.end(file.buffer);
  });
};

const deleteCloudinaryMedia = async (media) => {
  if (!media?.publicId) return;

  try {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === "image" ? "image" : "video",
    });
  } catch (error) {
    console.error("Cloudinary media deletion error:", error);
  }
};

const deleteCloudinaryBanner = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary banner deletion error:", error);
  }
};

const writeAuditLog = async ({
  admin,
  action,
  targetId,
  details = {},
  ipAddress = "",
}) => {
  try {
    await AuditLog.create({
      admin,
      action,
      targetType: "event",
      targetId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Event audit log error:", error);
  }
};

const notifyEventRegistration = async ({
  recipient,
  event,
  title,
  message,
  registration,
}) => {
  try {
    await createNotification({
      recipient,
      sender: null,
      type: "event_registration",
      title,
      message,
      link: "/events",
      event: event._id,
      metadata: {
        eventId: event._id,
        eventName: event.name,
        registrationId: registration?._id,
        registrationNumber: registration?.registrationNumber,
      },
    });
  } catch (error) {
    console.error("Event notification error:", error);
  }
};

const isRegistrationWindowOpen = (event, now = new Date()) => {
  if (event.participationMode === "automatic") {
    return false;
  }

  return (
    event.status === "published" &&
    (!event.registrationStartDate ||
      now >= new Date(event.registrationStartDate)) &&
    event.registrationEndDate &&
    now <= new Date(event.registrationEndDate)
  );
};

const validateEventDates = ({
  startDate,
  endDate,
  registrationStartDate,
  registrationEndDate,
  participationMode = "registration",
}) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Please provide valid event dates.";
  }

  if (end <= start) {
    return "Event end date must be after its start date.";
  }

  if (participationMode === "automatic") {
    return null;
  }

  const registrationStart = new Date(registrationStartDate);
  const registrationEnd = new Date(registrationEndDate);

  if (
    Number.isNaN(registrationStart.getTime()) ||
    Number.isNaN(registrationEnd.getTime())
  ) {
    return "Please provide valid registration dates.";
  }

  if (registrationEnd <= registrationStart) {
    return "Registration end date must be after its start date.";
  }

  if (registrationEnd > start) {
    return "Registration must close before the event starts.";
  }

  return null;
};

const validateEventCompetitionSettings = ({
  participationMode,
  winningCriteria,
  likeThreshold,
  entryFee,
  prizeAmount,
}) => {
  if (!participationModes.includes(participationMode)) {
    return "Please select a valid participation mode.";
  }

  if (!winningCriteriaOptions.includes(winningCriteria)) {
    return "Please select a valid winner selection method.";
  }

  if (
    !Number.isFinite(likeThreshold) ||
    !Number.isInteger(likeThreshold) ||
    likeThreshold < 1
  ) {
    return "Like threshold must be a positive whole number.";
  }

  if (!Number.isFinite(entryFee) || entryFee < 0) {
    return "Entry fee must be zero or greater.";
  }

  if (!Number.isFinite(prizeAmount) || prizeAmount < 0) {
    return "Prize amount must be zero or greater.";
  }

  if (
    winningCriteria === "first_to_likes" &&
    participationMode !== "automatic"
  ) {
    return "First-to-likes events must use automatic participation.";
  }

  if (winningCriteria === "first_to_likes" && entryFee > 0) {
    return "First-to-likes events must be free to enter.";
  }

  return null;
};

// ======================================================
// GET PUBLIC EVENTS
// ======================================================

export const getEvents = async (req, res) => {
  try {
    const { category, type, search, status = "published" } = req.query;

    const filter = {};

    if (req.user?.role !== "admin") {
      filter.status = "published";
    } else if (status !== "all") {
      filter.status = status;
    }

    if (category && category !== "all") {
      filter.category = { $in: [category, "all"] };
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ startDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name")
        .lean(),

      Event.countDocuments(filter),
    ]);

    const now = new Date();

    const formattedEvents = events.map((event) => {
      const registeredCount = event.reservedParticipants || 0;

      const isRegistrationOpen =
        isRegistrationWindowOpen(event, now) &&
        (event.maxParticipants === 0 ||
          registeredCount < event.maxParticipants);

      return {
        ...event,
        registeredCount,
        availableSeats:
          event.maxParticipants === 0
            ? null
            : Math.max(0, event.maxParticipants - registeredCount),
        isRegistrationOpen,
      };
    });

    return res.status(200).json({
      success: true,
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + events.length < total,
      },
    });
  } catch (error) {
    console.error("Get events error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch events.",
    });
  }
};

// ======================================================
// GET SINGLE EVENT
// ======================================================

export const getEvent = async (req, res) => {
  try {
    const { eventIdentifier } = req.params;

    const query = mongoose.Types.ObjectId.isValid(eventIdentifier)
      ? { _id: eventIdentifier }
      : { slug: eventIdentifier };

    const event = await Event.findOne(query)
      .populate("createdBy", "name")
      .populate("winner", "name")
      .populate("winningPost")
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const registeredCount = event.reservedParticipants || 0;

    let userRegistrations = [];

    if (req.user) {
      userRegistrations = await EventRegistration.find({
        event: event._id,
        user: req.user.id,
      })
        .populate("submission")
        .sort({ createdAt: -1 })
        .lean();
    }

    const isRegistrationOpen =
      isRegistrationWindowOpen(event) &&
      (event.maxParticipants === 0 || registeredCount < event.maxParticipants);

    return res.status(200).json({
      success: true,
      event: {
        ...event,
        registeredCount,
        availableSeats:
          event.maxParticipants === 0
            ? null
            : Math.max(0, event.maxParticipants - registeredCount),
        isRegistrationOpen,
        isUserRegistered: userRegistrations.length > 0,
        userRegistrations,
      },
    });
  } catch (error) {
    console.error("Get single event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch event details.",
    });
  }
};

// ======================================================
// REGISTER FOR EVENT
// ONE REGISTRATION = ONE CREATIVE SUBMISSION
// ======================================================

export const registerForEvent = async (req, res) => {
  let uploadedMedia = null;
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
      fontStyle,
      textAlign,
      tags,
      paymentMethod,
      paymentReference,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const eventBeforeUpload = await Event.findById(eventId);

    if (!eventBeforeUpload) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (eventBeforeUpload.participationMode === "automatic") {
      return res.status(400).json({
        success: false,
        message:
          "This event uses automatic participation. You do not need to register.",
      });
    }

    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }

    if (!category || !categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid creative category.",
      });
    }

    if (!title?.trim()) {
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

    if (description && description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters.",
      });
    }

    if (category === "words" && !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Written submissions require content.",
      });
    }

    if (category === "words" && content.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Written content cannot exceed 10000 characters.",
      });
    }

    if (
      category === "voice" &&
      (!req.file || !req.file.mimetype.startsWith("audio/"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Voice submissions require an audio file.",
      });
    }

    if (
      ["vision", "art"].includes(category) &&
      (!req.file || !req.file.mimetype.startsWith("image/"))
    ) {
      return res.status(400).json({
        success: false,
        message: "This category requires an image file.",
      });
    }

    if (category === "words" && req.file) {
      return res.status(400).json({
        success: false,
        message: "Written submissions must not include media files.",
      });
    }

    if (
      eventBeforeUpload.category !== "all" &&
      eventBeforeUpload.category !== category
    ) {
      return res.status(400).json({
        success: false,
        message: "This event does not accept your selected category.",
      });
    }

    if (!isRegistrationWindowOpen(eventBeforeUpload)) {
      return res.status(400).json({
        success: false,
        message: "Registration for this event is currently closed.",
      });
    }

    // Payment validation.
    const isPaidEvent = eventBeforeUpload.entryFee > 0;

    let normalizedReference = "";
    let normalizedPaymentMethod = "none";

    if (isPaidEvent) {
      if (!paymentReference?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Payment transaction reference is required.",
        });
      }

      normalizedReference = paymentReference.trim().toUpperCase();

      if (normalizedReference.length > 150) {
        return res.status(400).json({
          success: false,
          message: "Payment reference is too long.",
        });
      }

      if (!paymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid payment method.",
        });
      }

      normalizedPaymentMethod = paymentMethod;
    }

    if (req.file) {
      uploadedMedia = await uploadEventSubmissionMedia(req.file, category);
    }

    const registrationId = new mongoose.Types.ObjectId();
    const submissionId = new mongoose.Types.ObjectId();
    const registrationNumber = generateRegistrationNumber();
    const now = new Date();

    session = await mongoose.startSession();

    let registration;
    let submission;
    let event;

    await session.withTransaction(async () => {
      const capacityFilter = {
        _id: eventId,
        status: "published",
        participationMode: "registration",
        registrationStartDate: { $lte: now },
        registrationEndDate: { $gte: now },

        $expr: {
          $or: [
            { $eq: ["$maxParticipants", 0] },
            {
              $lt: [
                { $ifNull: ["$reservedParticipants", 0] },
                "$maxParticipants",
              ],
            },
          ],
        },
      };

      event = await Event.findOneAndUpdate(
        capacityFilter,
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

      if (!event) {
        throw new Error("EVENT_CLOSED_OR_CAPACITY_FULL");
      }

      if (event.category !== "all" && event.category !== category) {
        throw new Error("EVENT_CATEGORY_NOT_ALLOWED");
      }

      const submissionData = {
        _id: submissionId,
        event: event._id,
        registration: registrationId,
        user: userId,
        category,
        title: title.trim(),
        description: description?.trim() || "",
        content: category === "words" ? content.trim() : "",
        media: uploadedMedia || undefined,
        fontStyle: category === "words" ? fontStyle || "serif" : undefined,
        textAlign: category === "words" ? textAlign || "left" : undefined,
        tags: parseTags(tags),
        status: "pending_review",
      };

      const registrationData = {
        _id: registrationId,
        event: event._id,
        user: userId,
        submission: submissionId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
        notes: notes?.trim() || "",
        portfolioOrLink: portfolioOrLink?.trim() || "",

        paymentStatus: isPaidEvent ? "pending_verification" : "not_required",

        paymentMethod: normalizedPaymentMethod,
        paymentReference: isPaidEvent ? normalizedReference : undefined,

        amountDue: isPaidEvent ? event.entryFee : 0,
        amountPaid: 0,
        currency: event.currency,

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

      // Permanent transaction reference ledger.
      // Never delete old references or make them reusable.
      if (isPaidEvent) {
        await EventPaymentReference.create(
          [
            {
              reference: normalizedReference,
              registration: registration._id,
              event: event._id,
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

    await notifyEventRegistration({
      recipient: userId,
      event,
      registration,
      title: "Event Entry Submitted",
      message: isPaidEvent
        ? `Your entry for "${event.name}" has been submitted. Your payment and creative submission are awaiting admin review.`
        : `Your creative entry for "${event.name}" has been submitted and is awaiting review.`,
    });

    return res.status(201).json({
      success: true,
      message: isPaidEvent
        ? "Your entry has been submitted. Payment and creative review are pending."
        : "Your creative entry has been submitted successfully.",
      registration,
      submission,
    });
  } catch (error) {
    if (session) {
      await session.endSession().catch(() => {});
    }

    if (uploadedMedia?.publicId) {
      await deleteCloudinaryMedia(uploadedMedia);
    }

    if (error.message === "EVENT_CLOSED_OR_CAPACITY_FULL") {
      return res.status(400).json({
        success: false,
        message: "Registration is closed or the event is full.",
      });
    }

    if (error.message === "EVENT_CATEGORY_NOT_ALLOWED") {
      return res.status(400).json({
        success: false,
        message: "This event does not accept your selected category.",
      });
    }

    if (error.code === 11000) {
      if (error.keyPattern?.reference || error.keyPattern?.paymentReference) {
        return res.status(409).json({
          success: false,
          message: "This payment transaction reference has already been used.",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This entry could not be created because of a duplicate record.",
      });
    }

    console.error("Register event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your event entry.",
    });
  }
};

// ======================================================
// GET USER'S EVENT REGISTRATIONS
// ======================================================

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("event")
      .populate("submission")
      .lean();

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error("Get my registrations error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your registrations.",
    });
  }
};

// ======================================================
// CREATE EVENT - ADMIN
// ======================================================

export const createEvent = async (req, res) => {
  let uploadedBanner;

  try {
    const {
      name,
      description,
      type = "community",
      category = "all",
      location = "Online",
      isOnline = true,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
      entryFee = 0,
      currency = "NPR",
      maxParticipants = 0,
      eligibilityRequirements,
      rules,
      prizeInfo,
      prizeAmount = 0,
      prizeCurrency = "NPR",
      contactInfo,
      participationMode = "registration",
      winningCriteria = "none",
      likeThreshold = 1000,
      status = "published",
    } = req.body;

    if (!name?.trim() || !description?.trim() || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required event fields.",
      });
    }

    if (!participationModes.includes(participationMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid participation mode.",
      });
    }

    // Automatic events do not have a registration window.
    const normalizedRegistrationStart =
      participationMode === "automatic"
        ? new Date(startDate)
        : registrationStartDate;

    const normalizedRegistrationEnd =
      participationMode === "automatic"
        ? new Date(startDate)
        : registrationEndDate;

    if (
      participationMode === "registration" &&
      (!registrationStartDate || !registrationEndDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration dates are required for registered events.",
      });
    }

    const fee = Number(entryFee);
    const capacity = Number(maxParticipants);
    const threshold = Number(likeThreshold);
    const prize = Number(prizeAmount);

    if (
      !Number.isFinite(capacity) ||
      !Number.isInteger(capacity) ||
      capacity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant capacity.",
      });
    }

    const competitionError = validateEventCompetitionSettings({
      participationMode,
      winningCriteria,
      likeThreshold: threshold,
      entryFee: fee,
      prizeAmount: prize,
    });

    if (competitionError) {
      return res.status(400).json({
        success: false,
        message: competitionError,
      });
    }

    const dateError = validateEventDates({
      startDate,
      endDate,
      registrationStartDate: normalizedRegistrationStart,
      registrationEndDate: normalizedRegistrationEnd,
      participationMode,
    });

    if (dateError) {
      return res.status(400).json({
        success: false,
        message: dateError,
      });
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now().toString(36)}`;

    const eventData = {
      name: name.trim(),
      slug,
      description: description.trim(),
      type,
      category,
      location: String(location).trim(),
      isOnline: parseBoolean(isOnline, true),

      startDate: new Date(startDate),
      endDate: new Date(endDate),

      registrationStartDate: new Date(normalizedRegistrationStart),
      registrationEndDate: new Date(normalizedRegistrationEnd),

      participationMode,
      winningCriteria,
      likeThreshold: threshold,

      entryFee: fee,
      currency: String(currency).toUpperCase().trim(),

      prizeAmount: prize,
      prizeCurrency: String(prizeCurrency).toUpperCase().trim(),

      maxParticipants: capacity,
      reservedParticipants: 0,

      eligibilityRequirements:
        eligibilityRequirements?.trim() || "Open to all creators",

      rules: rules?.trim() || "",
      prizeInfo: prizeInfo?.trim() || "",
      contactInfo: contactInfo?.trim() || "",

      status,
      createdBy: req.user.id,
    };

    if (req.file) {
      uploadedBanner = await uploadEventBanner(req.file);

      eventData.bannerImage = uploadedBanner.secure_url;
      eventData.bannerPublicId = uploadedBanner.public_id;
    }

    const event = await Event.create(eventData);

    await writeAuditLog({
      admin: req.user.id,
      action: "event_created",
      targetId: event._id,
      details: {
        name: event.name,
        status: event.status,
        participationMode: event.participationMode,
        winningCriteria: event.winningCriteria,
        prizeAmount: event.prizeAmount,
      },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    if (uploadedBanner?.public_id) {
      await deleteCloudinaryBanner(uploadedBanner.public_id);
    }

    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create event.",
    });
  }
};

// ======================================================
// UPDATE EVENT - ADMIN
// ======================================================

export const updateEvent = async (req, res) => {
  let uploadedBanner;

  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const oldBannerPublicId = event.bannerPublicId;

    const fields = [
      "name",
      "description",
      "type",
      "category",
      "location",
      "eligibilityRequirements",
      "rules",
      "prizeInfo",
      "contactInfo",
      "status",
    ];

    for (const field of fields) {
      if (req.body[field] === undefined) continue;

      if (["name", "description", "location"].includes(field)) {
        event[field] = String(req.body[field]).trim();
      } else {
        event[field] = req.body[field];
      }
    }

    if (req.body.entryFee !== undefined) {
      const value = Number(req.body.entryFee);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid entry fee.",
        });
      }

      event.entryFee = value;
    }

    if (req.body.prizeAmount !== undefined) {
      const value = Number(req.body.prizeAmount);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid prize amount.",
        });
      }

      event.prizeAmount = value;
    }

    if (req.body.likeThreshold !== undefined) {
      const value = Number(req.body.likeThreshold);

      if (!Number.isInteger(value) || value < 1) {
        return res.status(400).json({
          success: false,
          message: "Like threshold must be a positive whole number.",
        });
      }

      event.likeThreshold = value;
    }

    if (req.body.maxParticipants !== undefined) {
      const value = Number(req.body.maxParticipants);

      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid participant capacity.",
        });
      }

      if (value > 0 && value < (event.reservedParticipants || 0)) {
        return res.status(400).json({
          success: false,
          message: "Capacity cannot be lower than currently reserved seats.",
        });
      }

      event.maxParticipants = value;
    }

    if (req.body.currency !== undefined) {
      event.currency = String(req.body.currency).toUpperCase().trim();
    }

    if (req.body.prizeCurrency !== undefined) {
      event.prizeCurrency = String(req.body.prizeCurrency).toUpperCase().trim();
    }

    if (req.body.participationMode !== undefined) {
      if (!participationModes.includes(req.body.participationMode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid participation mode.",
        });
      }

      event.participationMode = req.body.participationMode;
    }

    if (req.body.winningCriteria !== undefined) {
      if (!winningCriteriaOptions.includes(req.body.winningCriteria)) {
        return res.status(400).json({
          success: false,
          message: "Invalid winner selection method.",
        });
      }

      event.winningCriteria = req.body.winningCriteria;
    }

    if (req.body.isOnline !== undefined) {
      event.isOnline = parseBoolean(req.body.isOnline);
    }

    if (req.body.startDate !== undefined) {
      event.startDate = new Date(req.body.startDate);
    }

    if (req.body.endDate !== undefined) {
      event.endDate = new Date(req.body.endDate);
    }

    if (req.body.registrationStartDate !== undefined) {
      event.registrationStartDate = new Date(req.body.registrationStartDate);
    }

    if (req.body.registrationEndDate !== undefined) {
      event.registrationEndDate = new Date(req.body.registrationEndDate);
    }

    // Automatic events do not use registration dates.
    if (event.participationMode === "automatic") {
      event.registrationStartDate = event.startDate;
      event.registrationEndDate = event.startDate;
    } else if (!event.registrationStartDate || !event.registrationEndDate) {
      return res.status(400).json({
        success: false,
        message: "Registration dates are required for registered events.",
      });
    }

    const competitionError = validateEventCompetitionSettings({
      participationMode: event.participationMode,
      winningCriteria: event.winningCriteria,
      likeThreshold: event.likeThreshold,
      entryFee: event.entryFee,
      prizeAmount: event.prizeAmount,
    });

    if (competitionError) {
      return res.status(400).json({
        success: false,
        message: competitionError,
      });
    }

    const dateError = validateEventDates({
      startDate: event.startDate,
      endDate: event.endDate,
      registrationStartDate: event.registrationStartDate,
      registrationEndDate: event.registrationEndDate,
      participationMode: event.participationMode,
    });

    if (dateError) {
      return res.status(400).json({
        success: false,
        message: dateError,
      });
    }

    if (req.file) {
      uploadedBanner = await uploadEventBanner(req.file);

      event.bannerImage = uploadedBanner.secure_url;
      event.bannerPublicId = uploadedBanner.public_id;
    }

    await event.save();

    if (
      uploadedBanner &&
      oldBannerPublicId &&
      oldBannerPublicId !== uploadedBanner.public_id
    ) {
      await deleteCloudinaryBanner(oldBannerPublicId);
    }

    await writeAuditLog({
      admin: req.user.id,
      action: "event_updated",
      targetId: event._id,
      details: {
        name: event.name,
        status: event.status,
        participationMode: event.participationMode,
        winningCriteria: event.winningCriteria,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event,
    });
  } catch (error) {
    if (uploadedBanner?.public_id) {
      await deleteCloudinaryBanner(uploadedBanner.public_id);
    }

    console.error("Update event error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update event.",
    });
  }
};

// ======================================================
// DELETE EVENT - ADMIN
// ======================================================

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const submissions = await EventSubmission.find({
      event: eventId,
    }).lean();

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await EventRegistration.deleteMany({ event: eventId }, { session });

        // IMPORTANT:
        // Do not delete EventPaymentReference records.
        // This is a permanent ledger preventing old transaction
        // references from being reused, even after event deletion.

        await EventSubmission.deleteMany({ event: eventId }, { session });

        await Event.findByIdAndDelete(eventId, { session });
      });
    } finally {
      await session.endSession();
    }

    if (event.bannerPublicId) {
      await deleteCloudinaryBanner(event.bannerPublicId);
    }

    for (const submission of submissions) {
      if (submission.media?.publicId) {
        await deleteCloudinaryMedia(submission.media);
      }
    }

    await writeAuditLog({
      admin: req.user.id,
      action: "event_deleted",
      targetId: event._id,
      details: {
        name: event.name,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Event and its related registrations have been deleted.",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete event.",
    });
  }
};

// ======================================================
// GET EVENT PARTICIPANTS - ADMIN
// ======================================================

export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const [participants, total] = await Promise.all([
      EventRegistration.find({ event: eventId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email")
        .populate("submission")
        .lean(),

      EventRegistration.countDocuments({
        event: eventId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      participants,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + participants.length < total,
      },
    });
  } catch (error) {
    console.error("Get participants error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch event participants.",
    });
  }
};

// ======================================================
// UPDATE PARTICIPANT STATUS - ADMIN
// ======================================================

// Payment verification must use eventReviewController.
// This endpoint only supports cancellation and waitlisting.

export const updateParticipantStatus = async (req, res) => {
  let session;

  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID.",
      });
    }

    if (!["cancelled", "waitlist"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Use the dedicated review endpoints for payment or approval changes.",
      });
    }

    session = await mongoose.startSession();

    let registration;

    await session.withTransaction(async () => {
      registration =
        await EventRegistration.findById(registrationId).session(session);

      if (!registration) {
        throw new Error("REGISTRATION_NOT_FOUND");
      }

      if (registration.registrationStatus === "cancelled") {
        throw new Error("REGISTRATION_ALREADY_CANCELLED");
      }

      const shouldReleaseSeat = registration.reservesSeat === true;

      registration.registrationStatus = status;
      registration.reservesSeat = false;

      if (status === "cancelled") {
        registration.cancelledAt = new Date();
        registration.cancellationReason = "Cancelled by administrator.";
      }

      await registration.save({ session });

      if (shouldReleaseSeat) {
        await Event.updateOne(
          { _id: registration.event },
          {
            $inc: {
              reservedParticipants: -1,
            },
          },
          { session },
        );
      }
    });

    await session.endSession();
    session = null;

    await writeAuditLog({
      admin: req.user.id,
      action: "participant_status_updated",
      targetId: registration.event,
      details: {
        registrationId,
        status,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Participant status updated.",
      registration,
    });
  } catch (error) {
    if (session) {
      await session.endSession().catch(() => {});
    }

    if (error.message === "REGISTRATION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    if (error.message === "REGISTRATION_ALREADY_CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "This registration is already cancelled.",
      });
    }

    console.error("Update participant status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update participant record.",
    });
  }
};
