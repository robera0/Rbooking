import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  notification: [{ type: String }],
});

export const notificationModel = new mongoose.model(
  "notification",
  NotificationSchema
);
