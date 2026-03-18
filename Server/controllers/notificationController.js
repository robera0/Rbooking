import { notificationModel } from "../models/NotificationModel.js";

export const get_notification = async (req, res) => {
  try {
    const { user } = req.user;
    if (!user) return res.status(401).json({ message: "their is no user " });
    const validUser = await notificationModel
      .findOne({ user: user.id.toString() })
      .select("notifications");
    res.json({ user: validUser });
  } catch {
    res.status(401).json({ message: "the user id is not true " });
  }
};
