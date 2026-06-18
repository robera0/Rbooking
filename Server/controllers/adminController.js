import { Event } from "../models/EventsModel.js";
import { UserModel } from "../models/user.model.js";
import { AdminProfile } from "../models/AdminProfileModel.js";
import AdminProfileService from "Server/service/adminProfile.service.js";
import catchAsync from "../errors/catchAsync.js";
import UserService from "Server/service/user.service.js";

export const getAdminProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "their is no admin  " });
  const validAdmin = await AdminProfileService.findById({
    userId,
  }).populate("userId", "email username role status");
  res.json({ admin: validAdmin });
});
export const delete_users = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res
      .status(400)
      .json({ success: false, message: "Invalid userIds payload" });

  await UserService.deleteUsers(userIds);
  res.status(200).json({ success: true, message: "Users deleted" });
});

export const suspend_users = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });
  // Toggle logic or just set to suspended
  await UserService.suspendUsers(userIds);
  res.status(200).json({ success: true, message: "Users suspended" });
});

export const delete_events = catchAsync(async (req, res, next) => {
  const { eventIds } = req.body;
  if (!eventIds || !Array.isArray(eventIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });

  await Event.deleteMany({ _id: { $in: eventIds } });
  res.status(200).json({ success: true, message: "Events deleted" });
});

export const add_event = catchAsync(async (req, res, next) => {
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
});

export const add_user = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const newUser = await UserService.create({
    username: payload.username || `user_${Date.now()}`,
    email: payload.email,
    password: payload.password || "defaultPass123",
    role: payload.role || "user",
    status: "active",
  });

  res.status(201).json({ success: true, user: newUser });
});

export const update_user = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { role, status } = req.body;
  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (status !== undefined) updateData.status = status;
  const user = await UserService.findByIdAndUpdate(userId, updateData);

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  res.status(200).json({ success: true, user });
});
