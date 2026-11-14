import mongoose from "mongoose";

const competitionEntrySchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
      index: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["registered", "withdrawn"],
      default: "registered",
      index: true,
    },

    // Permanent score snapshot taken when the competition is finalized.
    // Null means the entry has not yet been finalized.
    finalLikes: {
      type: Number,
      default: null,
      min: 0,
    },

    // Exact time at which the final score was frozen.
    finalizedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// A post can only be registered once in a particular event.
competitionEntrySchema.index({ competition: 1, post: 1 }, { unique: true });

competitionEntrySchema.index({
  competition: 1,
  status: 1,
  registeredAt: 1,
});

const CompetitionEntry = mongoose.model(
  "CompetitionEntry",
  competitionEntrySchema,
);

export default CompetitionEntry;
