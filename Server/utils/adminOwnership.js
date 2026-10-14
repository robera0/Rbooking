import mongoose from "mongoose";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Event } from "../models/events.model.js";

// Events store adminId as the AdminProfile _id, but older events stored the
// User _id. Accept either.
export const getAdminIdentities = async (userId) => {
  const profile = await AdminProfile.findOne({ userId }).select("_id").lean();
  return [String(userId), profile ? String(profile._id) : null].filter(Boolean);
};

export const adminOwnsEvent = async (userId, event) => {
  if (!event?.adminId) return false;
  const ids = await getAdminIdentities(userId);
  return ids.includes(String(event.adminId._id ?? event.adminId));
};

// Returns the subset of eventIds the admin owns.
export const filterOwnedEventIds = async (userId, eventIds) => {
  const valid = eventIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const ids = await getAdminIdentities(userId);
  const owned = await Event.find({
    _id: { $in: valid },
    adminId: { $in: ids.map((i) => new mongoose.Types.ObjectId(i)) },
  })
    .select("_id")
    .lean();
  return owned.map((e) => e._id);
};
