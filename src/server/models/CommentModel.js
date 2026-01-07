import { Double } from "bson";
import mongoose from "mongoose";
import { type } from "node:os";

// COMMENTS SCHEMA

const CommentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comment: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User_Profile",
        required: true,
      },
      text: { type: String },
    },
  ],
  rating: {
    type: Double,
    default: 0,
    min: 0,
    max: 5,
    set: (v) => Math.round(v * 10) / 10, // rounds to 1 decimal
  },
  createdAt: { type: Date, default: Date.now },
});

export const CommentModel = mongoose.model("Comment", CommentSchema);
