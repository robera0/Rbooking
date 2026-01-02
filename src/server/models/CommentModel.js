import mongoose from "mongoose";

// COMMENTS SCHEMA

const CommentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  rating: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const CommentModel = mongoose.model("Comment", CommentSchema);
