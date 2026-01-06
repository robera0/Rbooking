import { CommentModel } from "../models/CommentModel.js";

export const get_comments = async (req, res) => {
  try {
    const { event } = req.user;
    const comment = await CommentModel.find({
      event: event.id.toString(),
    }).select("text", "rating");
    res.status(200).json({ comments: comment });
  } catch {
    res.status(401).json({ message: "No comments with the this id " });
  }
};
