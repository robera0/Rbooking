import AdminProfileService from "../service/adminProfile.service.js";
import catchAsync from "../errors/catchAsync.js";
import UserService from "../service/user.service.js";
import EventService from "../service/event.service.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import crypto from "crypto";
import { hashPasswords } from "../service/password.js";
import { filterOwnedEventIds } from "../utils/adminOwnership.js";
import { clearEventsCache, clearSingleEventCache } from "../config/redis.js";

export const getAdminProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "their is no admin  " });
  const validAdmin = await AdminProfile.findOne({ userId }).populate(
    "userId",
    "email username role status",
  );
  res.json({ admin: validAdmin });
});
export const deleteUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res
      .status(400)
      .json({ success: false, message: "Invalid userIds payload" });

  if (userIds.map(String).includes(String(req.user.id))) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot delete your own account" });
  }
  await UserService.deleteUsers(userIds);
  res.status(200).json({ success: true, message: "Users deleted" });
});

export const suspendUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });
  if (userIds.map(String).includes(String(req.user.id))) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot suspend your own account" });
  }
  await UserService.suspendUsers(userIds);
  res.status(200).json({ success: true, message: "Users suspended" });
});

export const deleteEvents = catchAsync(async (req, res, next) => {
  const { eventIds } = req.body;
  if (!eventIds || !Array.isArray(eventIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });

  // Only delete events this admin owns, and only their tickets with them.
  const ownedIds = await filterOwnedEventIds(req.user.id, eventIds);
  if (ownedIds.length !== eventIds.length) {
    return res
      .status(403)
      .json({ success: false, message: "You can only delete your own events" });
  }
  await EventService.deleteMany(ownedIds);
  await clearEventsCache();
  for (const id of ownedIds) await clearSingleEventCache(id.toString());
  res.status(200).json({ success: true, message: "Events deleted" });
});

export const addUser = catchAsync(async (req, res, next) => {
  const payload = req.body;
  if (!payload.email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  const role = ["admin", "user"].includes(payload.role) ? payload.role : "user";
  const email = String(payload.email).trim().toLowerCase();
  if (await UserService.findByEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  // No password is collected by the form, so issue a random temporary one
  // (hashed) and hand it back once. The old fixed default was stored
  // un-hashed, so those accounts could never log in.
  const temporaryPassword =
    payload.password || crypto.randomBytes(9).toString("base64url");
  const newUser = await UserService.create({
    email,
    password: await hashPasswords(temporaryPassword),
    role,
    status: "active",
  });

  const username = payload.username || `user_${Date.now()}`;
  await ProfileModel.create({
    userId: newUser._id,
    username: username,
    fullName: username,
  });

  res.status(201).json({
    success: true,
    user: newUser,
    temporaryPassword: payload.password ? undefined : temporaryPassword,
  });
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
  if (role !== undefined) {
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    updateData.role = role;
  }
  if (status !== undefined) {
    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    updateData.status = status;
  }
  if (String(userId) === String(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own role or status",
    });
  }
  if (updateData.status && updateData.status !== "active") {
    updateData.refreshTokens = [];
  }
  const user = await UserService.findByIdAndUpdate(userId, updateData);

  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  res.status(200).json({ success: true, user });
});
