import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    milestone: {
      type: Number,
      required: true, // e.g. 100, 200, 300
    },

    likeCountAtAchievement: {
      type: Number,
      required: true,
    },

    reachedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// A milestone for a post can only be recorded once
milestoneSchema.index({ post: 1, milestone: 1 }, { unique: true });

const Milestone = mongoose.model("Milestone", milestoneSchema);

export default Milestone;
