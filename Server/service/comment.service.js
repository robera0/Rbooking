import { CommentModel } from "../models/comment.model.js";

class commentService {
  static async create(commentData) {
    return await CommentModel.create(commentData);
  }
  static async find(eventId) {
    return await CommentModel.find({ eventId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userProfile",
        select: "fullName avatarUrl ",
      });
  }

  static async update(commentId, userId) {
    return await CommentModel.findByIdAndUpdate(
      commentId,
      {
        $addToSet: {
          likes: userId,
        },
      },
      { new: true },
    );
  }
}

export default commentService;
