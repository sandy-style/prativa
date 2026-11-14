import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    bannerImage: {
      type: String,
      default: "",
    },

    bannerPublicId: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "music",
        "photography",
        "art",
        "writing",
        "poetry",
        "showcase",
        "workshop",
        "live",
        "community",
      ],
      default: "community",
    },

    category: {
      type: String,
      enum: ["voice", "vision", "art", "words", "all"],
      default: "all",
    },

    participationMode: {
      type: String,
      enum: ["registration", "automatic"],
      default: "registration",
      index: true,
    },

    winningCriteria: {
      type: String,
      enum: ["none", "highest_likes", "first_to_likes", "admin_selected"],
      default: "none",
      index: true,
    },

    likeThreshold: {
      type: Number,
      default: 1000,
      min: 1,
    },

    location: {
      type: String,
      default: "Online",
      trim: true,
    },

    isOnline: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    registrationStartDate: {
      type: Date,
      default: Date.now,
    },

    registrationEndDate: {
      type: Date,
      required: true,
    },

    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "NPR",
      uppercase: true,
    },

    prizeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    prizeCurrency: {
      type: String,
      default: "NPR",
      uppercase: true,
    },

    maxParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },

    eligibilityRequirements: {
      type: String,
      default: "Open to all creators",
    },

    rules: {
      type: String,
      default: "",
    },

    prizeInfo: {
      type: String,
      default: "",
    },

    contactInfo: {
      type: String,
      default: "",
    },

    // Winner information
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    winningPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    winnerReachedAt: {
      type: Date,
      default: null,
    },

    winningLikesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isWinnerLocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    winnerVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    winnerAdminNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    winnerVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    winnerVerifiedAt: {
      type: Date,
      default: null,
    },

    // Event status
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// EVENT VALIDATION
// Synchronous middleware: no next() callback
// ==========================================

eventSchema.pre("validate", function () {
  if (
    this.winningCriteria === "first_to_likes" &&
    this.participationMode !== "automatic"
  ) {
    throw new Error("First-to-likes events must use automatic participation.");
  }

  if (this.winningCriteria === "first_to_likes" && this.entryFee > 0) {
    throw new Error("First-to-likes events must be free to enter.");
  }

  if (
    this.winningCriteria === "first_to_likes" &&
    (!Number.isFinite(this.likeThreshold) || this.likeThreshold < 1)
  ) {
    throw new Error("First-to-likes events must have a valid like threshold.");
  }

  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    throw new Error("Event end date must be after its start date.");
  }

  if (
    this.registrationEndDate &&
    this.registrationStartDate &&
    this.registrationEndDate < this.registrationStartDate
  ) {
    throw new Error(
      "Registration end date cannot be before registration start date.",
    );
  }

  if (
    this.isWinnerLocked &&
    (!this.winner || !this.winningPost || !this.winnerReachedAt)
  ) {
    throw new Error(
      "A locked winner must have a user, winning post, and winning date.",
    );
  }

  if (this.winnerVerificationStatus === "verified" && !this.winner) {
    throw new Error("A winner must exist before verification.");
  }
});

// ==========================================
// INDEXES
// ==========================================

eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ winningCriteria: 1, status: 1 });
eventSchema.index({ participationMode: 1, status: 1 });
eventSchema.index({ winner: 1 });
eventSchema.index({ isWinnerLocked: 1, status: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
