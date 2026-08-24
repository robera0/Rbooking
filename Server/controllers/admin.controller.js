import AdminProfileService from "../service/adminProfile.service.js";
import catchAsync from "../errors/catchAsync.js";
import UserService from "../service/user.service.js";
import EventService from "../service/event.service.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";

export const getAdminProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "their is no admin  " });
  const validAdmin = await AdminProfileService.findById({
    userId,
  }).populate("userId", "email username role status");
  res.json({ admin: validAdmin });
});
export const deleteUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res
      .status(400)
      .json({ success: false, message: "Invalid userIds payload" });

  await UserService.deleteUsers(userIds);
  res.status(200).json({ success: true, message: "Users deleted" });
});

export const suspendUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });
  // Toggle logic or just set to suspended
  await UserService.suspendUsers(userIds);
  res.status(200).json({ success: true, message: "Users suspended" });
});

export const deleteEvents = catchAsync(async (req, res, next) => {
  const { eventIds } = req.body;
  if (!eventIds || !Array.isArray(eventIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });

  await EventService.deleteMany(eventIds);
  res.status(200).json({ success: true, message: "Events deleted" });
});

export const addEvent = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const newEvent = await EventService.create({
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

export const addUser = catchAsync(async (req, res, next) => {
  const payload = req.body;
  const newUser = await UserService.create({
    email: payload.email,
    password: payload.password || "defaultPass123",
    role: payload.role || "user",
    status: "active",
  });

  const username = payload.username || `user_${Date.now()}`;
  await ProfileModel.create({
    userId: newUser._id,
    username: username,
    fullName: username,
  });

  res.status(201).json({ success: true, user: newUser });
});

export const getUsers = catchAsync(async (req, res, next) => {
  const users = await UserModel.find().select("-password -refreshTokens");
  
  const usersWithProfiles = await Promise.all(
    users.map(async (user) => {
      let profile = null;
      if (user.role === "admin") {
        profile = await AdminProfile.findOne({ userId: user._id });
      } else {
        profile = await ProfileModel.findOne({ userId: user._id });
      }
      
      return {
        ...user.toObject(),
        username: profile?.username || profile?.fullName || "",
        fullName: profile?.fullName || "",
      };
    })
  );
  
  res.status(200).json({ success: true, users: usersWithProfiles });
});

export const updateUser = catchAsync(async (req, res) => {
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
