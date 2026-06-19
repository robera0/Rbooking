import mongoose from "mongoose";
import commentService from "../service/comment.service.js";
import catchAsync from "../errors/catchAsync.js";
import ProfileService from "../service/profile.service.js";

// get comment
export const get_comments = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  const comment = await commentService.find(eventId);

  res.status(200).json({ comments: comment });
});

// post comment
export const post_comments = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const { text, rating } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment text is required" });
  }

  const userId = new mongoose.Types.ObjectId(req.user.id);

  const userProfile = await ProfileService.findByUserId(userId);
  if (!userProfile) {
    return res.status(404).json({ message: "User profile not found" });
  }

  const eventObjectId = new mongoose.Types.ObjectId(eventId);
  const newComment = {
    eventId: eventObjectId,
    userId: userId,
    userProfile: userProfile._id,
    text,
    rating,
  };

  const commentDoc = await commentService.create(newComment);

  res.status(200).json({
    message: "Comment added successfully",
    comments: commentDoc,
  });
});

// update comment liking and disliking comment
export const update_comment = catchAsync(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const { commentId } = req.body;

  const updatedComment = await commentService.findByIdAndUpdate(
    commentId,
    userId,
  );

  res.status(200).json({
    message: "Comment liked successfully",
    updatedComment,
  });
});
