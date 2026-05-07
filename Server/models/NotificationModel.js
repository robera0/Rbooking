import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  notifications: [
    {
      title: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["booking", "payment", "system", "reminder", "event"],
      },

      read: {
        type: Boolean,
        default: false,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export const notificationModel = new mongoose.model(
  "notification",
  NotificationSchema,
);
