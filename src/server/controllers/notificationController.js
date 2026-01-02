import { notificationModel } from "../models/NotificationModel";

export const get_notification = async (req, res) => {
  try {
    const { user_id } = req.params;
    const notification = notificationModel.findById(user_id);
    res.status(200).json({ noti: notification });
  } catch {
    res.status(401).json({ message: "the user id is not true " });
  }
};
