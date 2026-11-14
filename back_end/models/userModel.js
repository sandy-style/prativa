import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "restricted"],
      default: "active",
    },

    suspensionReason: {
      type: String,
      default: "",
    },

    restrictedUntil: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    // Email verification
    verificationCodeHash: {
      type: String,
      select: false,
    },

    verificationCodeExpires: {
      type: Date,
      select: false,
    },

    // Password reset
    resetCodeHash: {
      type: String,
      select: false,
    },

    resetCodeExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model("User", userSchema);

export default User;

