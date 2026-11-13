import AdminProfileService from "../service/adminProfile.service.js";
import catchAsync from "../errors/catchAsync.js";
import EventService from "../service/event.service.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { filterOwnedEventIds } from "../utils/adminOwnership.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import {
  UserAdminError,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUsersByAdmin,
  suspendUsersByAdmin,
} from "../service/userAdmin.service.js";

export const getAdminProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "their is no admin  " });
  const validAdmin = await AdminProfileService.findById({
    userId,
  }).populate("userId", "email username role status");
  res.json({ admin: validAdmin });
});
const sendUserAdminError = (error, res) => {
  if (error instanceof UserAdminError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  throw error;
};

export const deleteUsers = catchAsync(async (req, res) => {
  try {
    const { affected } = await deleteUsersByAdmin(req.user.id, req.body?.userIds);
    res.status(200).json({ success: true, message: "Users deleted", affected });
  } catch (error) {
    sendUserAdminError(error, res);
  }
});

export const suspendUsers = catchAsync(async (req, res) => {
  try {
    const { affected } = await suspendUsersByAdmin(req.user.id, req.body?.userIds);
    res.status(200).json({ success: true, message: "Users suspended", affected });
  } catch (error) {
    sendUserAdminError(error, res);
  }
});

export const deleteEvents = catchAsync(async (req, res, next) => {
  const { eventIds } = req.body;
  if (!eventIds || !Array.isArray(eventIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });

  // Only the organizer's own events can be deleted.
  const ownedIds = await filterOwnedEventIds(req.user.id, eventIds);
  await EventService.deleteMany(ownedIds);
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

export const addUser = catchAsync(async (req, res) => {
  try {
    const user = await createUserByAdmin(req.user.id, req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    sendUserAdminError(error, res);
  }
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
  try {
    const user = await updateUserByAdmin(req.user.id, req.params.userId, req.body || {});
    res.status(200).json({ success: true, user });
  } catch (error) {
    sendUserAdminError(error, res);
  }
});
