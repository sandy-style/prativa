import express from "express";

import {
  getEvents,
  getEvent,
  getMyRegistrations,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  updateParticipantStatus,
} from "../controllers/eventController.js";
import {
  getEventRegistrationsForReview,
  reviewEventPayment,
  reviewEventSubmission,
} from "../controllers/eventReviewController.js";
import { submitEventEntry } from "../controllers/eventSubmissionController.js";

import userAuth from "../middlewares/userAuth.js";
import { requireAdmin } from "../middlewares/adminAuth.js";
import upload from "../middlewares/uploadMiddleware.js";
import { resubmitEventEntry } from "../controllers/eventResubmissionController.js";
const eventRouter = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get published events
eventRouter.get("/", getEvents);

// Get logged-in user's event registrations
eventRouter.get("/mine", userAuth, getMyRegistrations);
// Admin event review routes
eventRouter.get(
  "/admin/registrations",
  userAuth,
  requireAdmin,
  getEventRegistrationsForReview,
);

eventRouter.patch(
  "/admin/registrations/:registrationId/payment",
  userAuth,
  requireAdmin,
  reviewEventPayment,
);

eventRouter.patch(
  "/admin/submissions/:submissionId/review",
  userAuth,
  requireAdmin,
  reviewEventSubmission,
);
// Get a single event by ID or slug
eventRouter.get("/:eventIdentifier", getEvent);

// ==========================================
// USER EVENT REGISTRATION
// ==========================================

// Submit ONE creative post as ONE event registration.
// Each additional post requires another registration.
eventRouter.post(
  "/:eventId/register",
  userAuth,
  upload.single("media"),
  submitEventEntry,
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Create event
eventRouter.post(
  "/",
  userAuth,
  requireAdmin,
  upload.single("banner"),
  createEvent,
);

// Update event
eventRouter.put(
  "/:eventId",
  userAuth,
  requireAdmin,
  upload.single("banner"),
  updateEvent,
);

// Cancel/delete event (existing controller behavior)
eventRouter.delete("/:eventId", userAuth, requireAdmin, deleteEvent);

// Get event participants/registrations
eventRouter.get(
  "/:eventId/participants",
  userAuth,
  requireAdmin,
  getEventParticipants,
);
eventRouter.patch(
  "/registrations/:registrationId/resubmit",
  userAuth,
  upload.single("media"),
  resubmitEventEntry,
);

// Existing participant status endpoint.
// We will replace/refine this when implementing separate
// payment verification and creative submission review.
eventRouter.patch(
  "/participants/:registrationId",
  userAuth,
  requireAdmin,
  updateParticipantStatus,
);

export default eventRouter;
