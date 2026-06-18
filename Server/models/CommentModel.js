import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userprofiles",
      required: true,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    repliesCount: {
      type: Number,
      default: 0,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      set: (v) => Math.round(v * 10) / 10,
    },
  },
  {
    timestamps: true,
  },
);

CommentSchema.index({ eventId: 1, createdAt: -1 });

export const CommentModel = mongoose.model("Comment", CommentSchema);
