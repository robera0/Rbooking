import { ProfileModel } from "../models/ProfileModel.js";
import { UserModel } from "../models/UserModel.js";

export const get_user_profile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const user_profile = await ProfileModel.findOne({ userId: user_id })
      .populate("userId")
      .exec();
    res.status(200).json({ user: user_profile });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
