import mongoose from "mongoose";

const eventMediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "audio"],
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const reviewHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "approved",
        "rejected",
        "changes_requested",
        "resubmitted",
        "withdrawn",
        "published",
      ],
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    // Private admin notes are not shown to the creator.
    adminNotes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const eventSubmissionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRegistration",
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Match the existing Post model's Manch categories.
    category: {
      type: String,
      enum: ["voice", "vision", "art", "words"],
      required: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Used for writing and poetry.
    content: {
      type: String,
      maxlength: 10000,
      default: "",
    },

    // Used for voice, vision and art.
    media: {
      type: eventMediaSchema,
      default: undefined,
    },

    fontStyle: {
      type: String,
      enum: ["serif", "sans", "devanagari", "handwritten"],
    },

    textAlign: {
      type: String,
      enum: ["left", "center", "right"],
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "pending_review",
        "approved",
        "rejected",
        "scheduled",
        "published",
        "withdrawn",
      ],
      default: "pending_review",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    // Publication is not immediate on approval.
    publishAt: {
      type: Date,
      default: null,
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    // Created only when the scheduled publication worker publishes it.
    publishedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    reviewHistory: {
      type: [reviewHistorySchema],
      default: [],
    },

    revisionCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastResubmittedAt: {
      type: Date,
      default: null,
    },

    withdrawnAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

eventSubmissionSchema.index({
  event: 1,
  status: 1,
  publishAt: 1,
});

eventSubmissionSchema.index({
  user: 1,
  event: 1,
  createdAt: -1,
});

eventSubmissionSchema.index(
  { publishedPost: 1 },
  {
    unique: true,
    partialFilterExpression: {
      publishedPost: { $type: "objectId" },
    },
  },
);

const EventSubmission = mongoose.model(
  "EventSubmission",
  eventSubmissionSchema,
);

export default EventSubmission;
