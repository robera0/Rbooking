import mongoose from "mongoose";
import { CommentModel } from "../models/CommentModel.js";
import { ProfileModel } from "../models/ProfileModel.js";

export const get_comments = async (req, res) => {
  try {
    const { eventId } = req.params;

    const comment = await CommentModel.find({ eventId }).populate({
      path: "userProfile",
      select: "fullName avatarUrl ",
    });
    res.status(200).json({ comments: comment });
  } catch {
    res.status(500).json({ message: "No comments with the this id " });
  }
};

export const post_comments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text, rating } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const user_profile = await ProfileModel.findOne({ userId });
    if (!user_profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const newComment = {
      eventId,
      userId: userId,
      userProfile: userId,
      text,
      rating,
    };

    const commentDoc = await CommentModel.create(newComment);

    await commentDoc.save();
    res.status(200).json({
      message: "Comment added successfully",
      comments: commentDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const update_comment = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const { commentId } = req.body;

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        $addToSet: {
          likes: userId,
        },
      },
      { new: true },
    );

    res.status(200).json({
      message: "Comment liked successfully",
      updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
