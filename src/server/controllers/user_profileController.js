import { ProfileModel } from "../models/ProfileModel";

export const get_user_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const user_profile = await ProfileModel.find({ user_id })
      .select("-__v")
      .populate("userId");
    res.status(200).json({ user: user_profile });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
