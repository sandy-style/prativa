import mongoose from "mongoose";

const eventPaymentReferenceSchema = new mongoose.Schema(
  {
    // Normalized transaction reference.
    // This value must never be reused.
    reference: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 150,
    },

    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRegistration",
      required: true,
      index: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["submitted", "verified", "rejected"],
      default: "submitted",
      index: true,
    },

    // True when this is the registration's current reference.
    // Older rejected references remain in the ledger.
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// A transaction reference is globally unique across PRATIVA.
// Never delete rejected reference records.
eventPaymentReferenceSchema.index({ reference: 1 }, { unique: true });

eventPaymentReferenceSchema.index({
  registration: 1,
  submittedAt: -1,
});

const EventPaymentReference = mongoose.model(
  "EventPaymentReference",
  eventPaymentReferenceSchema,
);

export default EventPaymentReference;
