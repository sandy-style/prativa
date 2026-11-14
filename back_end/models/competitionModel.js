import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    competitionType: {
      type: String,
      enum: ["individual_post", "event"],
      default: "individual_post",
      index: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },

    likeThreshold: {
      type: Number,
      default: 1000,
      min: 1,
    },

    eligibleManchs: {
      type: [String],
      enum: ["voice", "vision", "art", "words"],
      default: ["voice", "vision", "art", "words"],
    },

    participantType: {
      type: String,
      enum: ["all", "registered"],
      default: "all",
    },

    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "active",
      index: true,
    },

    isDefaultOverall: {
      type: Boolean,
      default: false,
    },

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
    },

    isWinnerLocked: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

competitionSchema.index({ status: 1, isDefaultOverall: 1 });
competitionSchema.index({ competitionType: 1, status: 1, endDate: 1 });

const Competition = mongoose.model("Competition", competitionSchema);

export default Competition;
