import { Event } from "../models/EventsModel.js";
import { UserModel } from "../models/UserModel.js";
import { AdminProfile } from "../models/AdminProfileModel.js";
export const adminProfile = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "their is no admin  " });
  await AdminProfile.findOne({
    userId,
  }).populate("userId", "email username role status");
};
export const delete_users = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds))
      return res
        .status(400)
        .json({ success: false, message: "Invalid userIds payload" });

    await UserModel.deleteMany({ _id: { $in: userIds } });
    res.status(200).json({ success: true, message: "Users deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspend_users = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds))
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });

    // Toggle logic or just set to suspended
    await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: "suspended" } },
    );
    res.status(200).json({ success: true, message: "Users suspended" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const delete_events = async (req, res) => {
  try {
    const { eventIds } = req.body;
    if (!eventIds || !Array.isArray(eventIds))
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });

    await Event.deleteMany({ _id: { $in: eventIds } });
    res.status(200).json({ success: true, message: "Events deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const add_event = async (req, res) => {
  try {
    const payload = req.body;
    const newEvent = await Event.create({
      type: "event", // Base required discriminator
      name: payload.name || "Untitled Event",
      desc: payload.desc || "",
      dates: {
        start: {
          localDate: payload.date || new Date().toISOString().split("T")[0],
        },
      },
      ...payload,
    });

    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const add_user = async (req, res) => {
  try {
    const payload = req.body;
    const newUser = await UserModel.create({
      username: payload.username || `user_${Date.now()}`,
      email: payload.email,
      password: payload.password || "defaultPass123",
      role: payload.role || "user",
      status: "active",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update_user = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role, status } },
      { new: true },
    ).select("-password -refreshTokens");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
