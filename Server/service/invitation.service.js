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

const MAX_QUANTITY = 20;

// Creates one single-use pass per guest. Only the organizer who owns the
// event can do this.
export async function createGuestInvitations(eventId, userId, input = {}) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new InvitationError(400, "INVALID_EVENT", "Invalid event id");
  }

  const guestName = String(input.guestName || "").trim();
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  const phone = String(input.phone || "").replace(/[\s-]/g, "");
  const quantity = Number(input.quantity ?? 1);

  if (!guestName) {
    throw new InvitationError(400, "NAME_REQUIRED", "Guest name is required");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InvitationError(400, "INVALID_EMAIL", "Enter a valid email");
  }
  if (phone && !/^\+?\d{7,15}$/.test(phone)) {
    throw new InvitationError(
      400,
      "INVALID_PHONE",
      "Enter a valid phone number",
    );
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new InvitationError(
      400,
      "INVALID_QUANTITY",
      `Quantity must be between 1 and ${MAX_QUANTITY}`,
    );
  }

  const event = await Event.findById(eventId)
    .select("name adminId invitation")
    .lean();
  if (!event)
    throw new InvitationError(404, "EVENT_NOT_FOUND", "Event not found");

  const adminProfile = await AdminProfile.findOne({ userId })
    .select("_id")
    .lean();
  if (!adminProfile) {
    throw new InvitationError(403, "ADMIN_REQUIRED", "Admin profile not found");
  }
  if (!(await adminOwnsEvent(userId, event))) {
    throw new InvitationError(
      403,
      "NOT_YOUR_EVENT",
      "You can only manage invitations for your own events",
    );
  }
  if (!event.invitation?.enabled) {
    throw new InvitationError(
      400,
      "INVITATIONS_DISABLED",
      "Invitations are not enabled for this event",
    );
  }

  const orderId = new mongoose.Types.ObjectId();
  const invitations = await Invitation.insertMany(
    Array.from({ length: quantity }, () => ({
      eventId: event._id,
      adminId: adminProfile._id,
      orderId,
      guestName,
      email: email || undefined,
      phone: phone || undefined,
    })),
  );

  return { invitations, orderId, eventName: event.name, eventId: event._id };
}

// Called with every gate scan token. Returns null when the token is not an
// invitation, throws 403 when it belongs to another organizer's event (without
// consuming or counting it), otherwise { status: "ok" | "used" | "invalid" }.
export async function checkInInvitation(token, scannerUserId) {
  if (typeof token !== "string" || !token) return null;

  const existing = await Invitation.findOne({ ticketId: token }).lean();
  if (!existing) return null;

  const event = await Event.findById(existing.eventId)
    .select("name adminId")
    .lean();
  if (!event || !(await adminOwnsEvent(scannerUserId, event))) {
    throw new InvitationError(
      403,
      "NOT_YOUR_EVENT",
      "This invitation is for another organizer's event",
    );
  }

  // Atomic: of any number of simultaneous scans only one gets the document.
  const checkedIn = await Invitation.findOneAndUpdate(
    { _id: existing._id, isVerified: true, isChecked: { $ne: true } },
    {
      $set: { isChecked: true, checkedInAt: new Date() },
      $inc: { scanCount: 1 },
      $currentDate: { lastScannedAt: true },
    },
    { new: true },
  ).lean();
  if (checkedIn)
    return { status: "ok", invitation: checkedIn, eventName: event.name };

  // Rejected scan: count it so reuse attempts are visible.
  const current = await Invitation.findOneAndUpdate(
    { _id: existing._id },
    { $inc: { scanCount: 1 }, $currentDate: { lastScannedAt: true } },
    { new: true },
  ).lean();
  return {
    status: current.isChecked ? "used" : "invalid",
    invitation: current,
    eventName: event.name,
  };
}
