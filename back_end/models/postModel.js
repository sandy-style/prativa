import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
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

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    // Used for poetry, stories and other written work
    content: {
      type: String,
      maxlength: 10000,
      default: "",
    },

    // Used for voice, vision and art
    media: {
      type: mediaSchema,
      default: undefined,
    },

    // Poetry typography preferences
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
  },
  {
    timestamps: true,
  },
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
