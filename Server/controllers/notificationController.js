import { notificationModel } from "../models/NotificationModel.js";
import mongoose from "mongoose";

export const get_notification = async (req, res) => {
  console.log(req.user);
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    if (!userId) return res.status(401).json({ message: "No user found" });
    const validUser = await notificationModel
      .findOne({ userId })
      .select("notifications");
    const notificationlength = validUser?.notifications.length;
    return res.status(200).json({
      notifications: validUser?.notifications || [],
      len: notificationlength,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const read_notification = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    if (!userId) return res.status(401).json({ message: "their is no user " });
    const { notId } = req.body;
    const updatedNotification = await notificationModel.findOneAndUpdate(
      { userId, "notifications._id": notId },
      {
        $set: {
          "notifications.$.read": true,
        },
      },
    );

    return updatedNotification;
  } catch {
    res.status(401).json({ message: "the user id is not true " });
  }
};
