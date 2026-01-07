import { CommentModel } from "../models/CommentModel.js";

export const get_comments = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("the user is ", id);

    const comment = await CommentModel.find({ eventId: id });
    res.status(200).json({ comments: comment });
  } catch {
    res.status(401).json({ message: "No comments with the this id " });
  }
};
