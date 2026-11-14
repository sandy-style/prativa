import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "new_subscriber",
        "new_post",
        "like_milestone",
        "post_liked",
        "post_commented",
        "event_announcement",
        "event_registration",
        "competition_result",
        "winner_announcement",
        "admin_notice",
        "report_update",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    link: {
      type: String,
      default: "",
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
