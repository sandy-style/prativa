import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
      index: true,
    },

    competitionName: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    totalQualifyingLikes: {
      type: Number,
      required: true,
      default: 0,
    },

    thresholdRequired: {
      type: Number,
      required: true,
      default: 0,
    },

    reachedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    verificationStatus: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      default: "verified",
      index: true,
    },

    adminNotes: {
      type: String,
      default: "",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

winnerSchema.index({ competition: 1 }, { unique: true });

const Winner = mongoose.model("Winner", winnerSchema);

export default Winner;
