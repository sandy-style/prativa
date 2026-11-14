import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ["post", "user"],
      required: true,
      index: true,
    },

    targetPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Snapshot of reported content in case original post/user gets edited or deleted
    contentSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    reason: {
      type: String,
      enum: [
        "harassment",
        "hate_speech",
        "inappropriate_content",
        "spam",
        "copyright_violation",
        "impersonation",
        "violence",
        "privacy_violation",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },

    moderatorNotes: {
      type: String,
      trim: true,
      default: "",
    },

    actionTaken: {
      type: String,
      enum: [
        "none",
        "post_removed",
        "user_suspended",
        "user_restricted",
        "warning_issued",
        "dismissed",
      ],
      default: "none",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate reports by the same user on the same post or user
reportSchema.index({ reporter: 1, targetType: 1, targetPost: 1 }, {
  unique: true,
  partialFilterExpression: { targetPost: { $exists: true, $ne: null } }
});

reportSchema.index({ reporter: 1, targetType: 1, targetUser: 1 }, {
  unique: true,
  partialFilterExpression: { targetUser: { $exists: true, $ne: null } }
});

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
