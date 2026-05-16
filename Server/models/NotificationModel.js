import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  //token: { type: mongoose.Schema.Types.ObjectId, ref: "NotificationToken" },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdBy: { type: String, required: true },
  status: { type: String, default: "active", enum: ["active", "inactive"] },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
