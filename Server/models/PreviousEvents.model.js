import mongoose from "mongoose";

const OrganizerPostSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile",
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: ["photo", "video"],
      required: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    mediaUrl: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    eventDate: {
      type: Date,
      default: null,
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

OrganizerPostSchema.index({
  adminId: 1,
  isPublished: 1,
  createdAt: -1,
});

export const OrganizerPost = mongoose.model(
  "OrganizerPost",
  OrganizerPostSchema,
);
