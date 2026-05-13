import mongoose from "mongoose";
import { CommentModel } from "../models/CommentModel.js";
import { ProfileModel } from "../models/ProfileModel.js";

export const get_comments = async (req, res) => {
  try {
    const { eventId } = req.params;

    const comment = await CommentModel.find({ eventId });
    res.status(200).json({ comments: comment });
  } catch {
    res.status(500).json({ message: "No comments with the this id " });
  }
};

export const post_comments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const user_profile = await ProfileModel.findOne({ userId });
    if (!user_profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const newComment = {
      userId: user_profile._id,
      text,
    };

    const commentDoc = await CommentModel.findOneAndUpdate(
      { eventId },
      {
        $setOnInsert: {
          eventId,
          user: userId,
          rating: 0,
        },
        $push: { comment: newComment },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      message: "Comment added successfully",
      comments: commentDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};
