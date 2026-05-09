import { notificationModel } from "../models/NotificationModel.js";
import mongoose from "mongoose";

export const get_notification = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    if (!userId) return res.status(401).json({ message: "No user found" });
    const validUser = await notificationModel
      .findOne({ userId })
      .select("notifications");
    const notificationlength = validUser?.notifications?.filter(
      (noti) => noti.read === false,
    ).length;
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
    const { notId } = req.body;
    const notificationObjectId = new mongoose.Types.ObjectId(notId);

    const updatedNotification = await notificationModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          "notifications.$[elem].read": true,
        },
      },
      {
        arrayFilters: [{ "elem._id": notificationObjectId }],
        new: true,
      },
    );
    console.log(userId, notificationObjectId);

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
