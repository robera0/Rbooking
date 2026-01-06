import { UserModel } from "../models/UserModel.js";

export const user = async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).json({ message: "their is no user " });
    const validUser = await UserModel.findOne({ email: user.email }).select(
      "-password"
    );
    res.json({ user: validUser });
  } catch {
    res.status(401).json({ message: "the user id is not true " });
  }
};
