import crypto from "crypto";
import mongoose from "mongoose";
import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Invitation } from "../models/invitation.model.js";
import { adminOwnsEvent } from "../utils/adminOwnership.js";

export class InvitationError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "InvitationError";
    this.status = status;
    this.code = code;
  }
}

const newToken = () => crypto.randomBytes(8).toString("hex");

// Returns the event's invitation, creating it on first use. Only the organizer
// who owns the event can do this.
export async function getOrCreateInvitation(eventId, userId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new InvitationError(400, "INVALID_EVENT", "Invalid event id");
  }

  const event = await Event.findById(eventId).select("name adminId invitation").lean();
  if (!event) throw new InvitationError(404, "EVENT_NOT_FOUND", "Event not found");
  if (!event.invitation?.enabled) {
    throw new InvitationError(400, "INVITATIONS_DISABLED", "Invitations are not enabled for this event");
  }

  const adminProfile = await AdminProfile.findOne({ userId }).select("_id").lean();
  if (!adminProfile) {
    throw new InvitationError(403, "ADMIN_REQUIRED", "Admin profile not found");
  }
  if (!(await adminOwnsEvent(userId, event))) {
    throw new InvitationError(403, "NOT_YOUR_EVENT", "You can only manage invitations for your own events");
  }

  // One atomic find-or-create, so simultaneous requests share one invitation.
  const invitation = await Invitation.findOneAndUpdate(
    { eventId: event._id },
    { $setOnInsert: { adminId: adminProfile._id, ticketId: newToken() } },
    { upsert: true, new: true },
  ).lean();

  return { invitation, eventName: event.name };
}

// Called with every gate scan token. Returns null when the token is not an
// invitation (so the caller can treat it as something else), the invitation
// with its scan count updated when it is, and throws when it belongs to
// another organizer's event.
export async function recordInvitationScan(token, scannerUserId) {
  if (typeof token !== "string" || !token) return null;

  const invitation = await Invitation.findOne({ ticketId: token, isVerified: true }).lean();
  if (!invitation) return null;

  const event = await Event.findById(invitation.eventId).select("name adminId").lean();
  if (!event || !(await adminOwnsEvent(scannerUserId, event))) {
    throw new InvitationError(403, "NOT_YOUR_EVENT", "This invitation is for another organizer's event");
  }

  const updated = await Invitation.findOneAndUpdate(
    { _id: invitation._id },
    { $inc: { scanCount: 1 }, $set: { lastScannedAt: new Date() } },
    { new: true },
  ).lean();

  return { ...updated, eventId: { _id: event._id, name: event.name } };
}
