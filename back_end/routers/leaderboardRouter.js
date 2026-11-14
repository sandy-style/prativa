import express from "express";

import {
  getLeaderboard,
  getLeaderboardEvents,
  getAdminWinners,
  updateWinnerStatus,
  selectEventWinner,
  finalizeEventManually,
} from "../controllers/leaderboardController.js";

import userAuth from "../middlewares/userAuth.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const leaderboardRouter = express.Router();

// ======================================================
// PUBLIC LEADERBOARD ROUTES
// ======================================================

// Get leaderboard for a specific Event.
// GET /api/leaderboard?eventId=EVENT_ID
leaderboardRouter.get("/", getLeaderboard);

// Get all Events that have leaderboard functionality.
// GET /api/leaderboard/events
leaderboardRouter.get("/events", getLeaderboardEvents);

// ======================================================
// ADMIN WINNER MANAGEMENT ROUTES
// ======================================================

// Get all Event winners.
// GET /api/leaderboard/admin/winners
leaderboardRouter.get(
  "/admin/winners",
  userAuth,
  requireAdmin,
  getAdminWinners,
);

// Verify or reject an Event winner.
// PATCH /api/leaderboard/admin/winners/:winnerId
leaderboardRouter.patch(
  "/admin/winners/:winnerId",
  userAuth,
  requireAdmin,
  updateWinnerStatus,
);

// Manually select a winner for an admin-selected Event.
// POST /api/leaderboard/admin/events/:eventId/select-winner
leaderboardRouter.post(
  "/admin/events/:eventId/select-winner",
  userAuth,
  requireAdmin,
  selectEventWinner,
);

// Manually finalize an Event.
// POST /api/leaderboard/admin/events/:eventId/finalize
leaderboardRouter.post(
  "/admin/events/:eventId/finalize",
  userAuth,
  requireAdmin,
  finalizeEventManually,
);

export default leaderboardRouter;
