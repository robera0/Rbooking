import AdminProfileService from "../service/adminProfile.service.js";
import catchAsync from "../errors/catchAsync.js";
import EventService from "../service/event.service.js";
import UserService from "../service/user.service.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { Event } from "../models/events.model.js";
import { filterOwnedEventIds } from "../utils/adminOwnership.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import {
  UserAdminError,
  createUserByAdmin,
} from "../service/userAdmin.service.js";
import { recordAudit } from "../service/audit.service.js";

const isSuperAdmin = (req) => req.user?.role === "super_admin";

// An organizer may only see/manage people who bought a ticket to one of
// their own events. Without this, every admin can read the whole platform.
const resolveAdminUserIds = async (userId) => {
  const profile = await AdminProfile.findOne({ userId }).select("_id").lean();
  const refs = [String(userId), profile ? String(profile._id) : null].filter(
    Boolean,
  );
  const events = await Event.find({ adminId: { $in: refs } })
    .select("_id")
    .lean();
  if (!events.length) return [];
  const tickets = await TicketModel.find({
    eventId: { $in: events.map((event) => event._id) },
  })
    .select("_id")
    .lean();
  if (!tickets.length) return [];
  return UserTicketModel.distinct("userId", {
    ticketId: { $in: tickets.map((ticket) => ticket._id) },
  });
};

const ensureScopedUser = async (req, targetUserId) => {
  if (isSuperAdmin(req)) return true;
  const scoped = await resolveAdminUserIds(req.user.id);
  return scoped.some((id) => String(id) === String(targetUserId));
};

export const getAdminProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: "their is no admin  " });
  const validAdmin = await AdminProfileService.findById({
    userId,
  }).populate("userId", "email username role status");
  res.json({ admin: validAdmin });
});

export const deleteUsers = catchAsync(async (req, res, next) => {
  if (!isSuperAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Only a super admin can delete accounts",
    });
  }
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res
      .status(400)
      .json({ success: false, message: "Invalid userIds payload" });
  if (userIds.some((id) => String(id) === String(req.user.id))) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot delete your own account" });
  }

  await UserService.deleteUsers(userIds);
  await recordAudit({
    req,
    action: "user.delete",
    entityType: "user",
    entityId: userIds.join(","),
    message: `Deleted ${userIds.length} account(s)`,
    metadata: { userIds },
  });
  res.status(200).json({ success: true, message: "Users deleted" });
});

export const suspendUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds))
    return res.status(400).json({ success: false, message: "Invalid payload" });

  if (userIds.some((id) => String(id) === String(req.user.id))) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot suspend your own account" });
  }

  if (!isSuperAdmin(req)) {
    const scoped = await resolveAdminUserIds(req.user.id);
    const scopedSet = new Set(scoped.map(String));
    const outside = userIds.filter((id) => !scopedSet.has(String(id)));
    if (outside.length) {
      return res.status(403).json({
        success: false,
        message: "You can only suspend buyers of your own events",
      });
    }
  }

  await UserService.suspendUsers(userIds);
  await recordAudit({
    req,
    action: "user.suspend",
    entityType: "user",
    entityId: userIds.join(","),
    message: `Suspended ${userIds.length} account(s)`,
    metadata: { userIds },
  });
  res.status(200).json({ success: true, message: "Users suspended" });
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
  const role = req.body?.role || "user";
  if (!isSuperAdmin(req) && !["user", "club_owner"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Only a super admin can create that role",
    });
  }
  try {
    const user = await createUserByAdmin(req.user.id, { ...req.body, role });
    await recordAudit({
      req,
      action: "user.create",
      entityType: "user",
      entityId: String(user._id),
      message: `Created ${role} account ${user.email}`,
    });
    res.status(201).json({ success: true, user });
  } catch (error) {
    if (error instanceof UserAdminError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    throw error;
  }
});

export const getUsers = catchAsync(async (req, res, next) => {
  const filter = {};
  if (!isSuperAdmin(req)) {
    filter._id = { $in: await resolveAdminUserIds(req.user.id) };
  }

  const users = await UserModel.find(filter).select("-password -refreshTokens");

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
    }),
  );

  res.status(200).json({ success: true, users: usersWithProfiles });
});

export const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { role, status } = req.body;

  const target = await UserModel.findById(userId);
  if (!target)
    return res.status(404).json({ success: false, message: "User not found" });

  if (!(await ensureScopedUser(req, userId))) {
    return res.status(403).json({
      success: false,
      message: "You can only manage buyers of your own events",
    });
  }

  const updateData = {};
  if (role !== undefined) {
    if (!["user", "admin", "club_owner", "super_admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role" });
    }
    if (!isSuperAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only a super admin can change roles",
      });
    }
    if (String(target._id) === String(req.user.id) && role !== target.role) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }
    updateData.role = role;
  }
  if (status !== undefined) {
    if (!["active", "suspended", "banned"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    updateData.status = status;
  }
  if (!Object.keys(updateData).length) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  const user = await UserService.findByIdAndUpdate(userId, updateData);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  await recordAudit({
    req,
    action: "user.update",
    entityType: "user",
    entityId: userId,
    message: `Updated ${target.email}`,
    metadata: {
      before: { role: target.role, status: target.status },
      after: updateData,
    },
  });

  res.status(200).json({ success: true, user });
});
