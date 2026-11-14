import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
      // e.g. "user_suspended", "post_deleted", "winner_verified", "event_created", "report_resolved"
    },

    targetType: {
      type: String,
      enum: ["user", "post", "report", "event", "competition", "winner", "setting"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
