import mongoose from "mongoose";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { UserModel } from "../models/user.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { ScanLog } from "../models/scanLog.model.js";
import { getPlatformSetting } from "../models/platformSetting.model.js";
import { recordAudit } from "./audit.service.js";
import {
  clearEventsCache,
  clearSingleEventCache,
  clearTicketCache,
  clearTicketInfoCache,
} from "../config/redis.js";
import AppError from "../errors/AppError.js";

const EVENT_STATUSES = ["draft", "published", "cancelled", "archived"];
const USER_STATUSES = ["active", "suspended", "banned"];
const ROLES = ["user", "admin", "club_owner", "super_admin"];

const round2 = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round((parsed + Number.EPSILON) * 100) / 100;
};

const oid = (value, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return new mongoose.Types.ObjectId(String(value));
};

const actor = (req) => req?.user || {};

async function loadOrder(orderId) {
  const order = await UserTicketModel.findById(orderId)
    .populate({
      path: "ticketId",
      populate: { path: "eventId" },
    })
    .lean();
  if (!order) throw new AppError("Order not found", 404);
  return order;
}

async function buyerNameFor(userId) {
  const [profile, user] = await Promise.all([
    ProfileModel.findOne({ userId }).select("fullName").lean(),
    UserModel.findById(userId).select("email").lean(),
  ]);
  return profile?.fullName || user?.email || "Unknown buyer";
}

async function commissionFor(order, setting) {
  let rate = Number(setting?.commissionRate ?? 0.1);
  const event = order?.ticketId?.eventId;
  const adminRef = event?.adminId;
  if (adminRef) {
    const profile = await AdminProfile.findOne({
      $or: [{ _id: adminRef }, { userId: adminRef }],
    })
      .select("commissionRate")
      .lean();
    const override = profile?.commissionRate;
    if (
      override !== null &&
      override !== undefined &&
      Number.isFinite(Number(override))
    ) {
      rate = Number(override);
    }
  }
  return {
    rate,
    amount: round2(Number(order.totalAmount || 0) * rate),
  };
}

function assertEventNotStarted(order, actionLabel) {
  const startsAt = order?.ticketId?.eventId?.dates?.start?.dateTime;
  if (startsAt && new Date(startsAt).getTime() < Date.now()) {
    throw new AppError(
      `This event has already started; ${actionLabel} is no longer available.`,
      400,
    );
  }
}

async function refreshOrderCaches(order) {
  await Promise.all([
    clearTicketCache(order.userId),
    clearTicketInfoCache(order._id),
  ]);
}

async function logManualCheckIn(req, order) {
  try {
    const event = order.ticketId?.eventId;
    await ScanLog.create({
      orderId: order._id,
      orderNo: order.orderNo,
      eventId: event?._id || null,
      eventName: event?.name || "",
      buyerName: await buyerNameFor(order.userId),
      tierName: order.ticketId?.name || order.ticketType || "",
      scannerId: actor(req).id || null,
      scannerEmail: actor(req).email || "",
      result: "checked_in",
    });
  } catch (error) {
    console.error("[actions] could not record manual scan", error.message);
  }
}

/* ── events ───────────────────────────────────────────────────────────── */

export async function updateEventStatus(req, eventId, { status, isFeatured, note } = {}) {
  const id = oid(eventId, "event id");
  const event = await Event.findOne({ _id: id, deletedAt: null });
  if (!event) throw new AppError("Event not found", 404);

  if (status === undefined && isFeatured === undefined) {
    throw new AppError("Nothing to update", 400);
  }
  if (status !== undefined && !EVENT_STATUSES.includes(status)) {
    throw new AppError("Invalid event status", 400);
  }

  if (status === "published") {
    const activeTiers = await TicketModel.countDocuments({
      eventId: event._id,
      isActive: { $ne: false },
    });
    if (activeTiers === 0) {
      throw new AppError(
        "Add at least one active ticket tier before publishing this event.",
        400,
      );
    }
  }

  const before = { status: event.status, isFeatured: event.isFeatured };
  if (status !== undefined) event.status = status;
  if (isFeatured !== undefined) event.isFeatured = Boolean(isFeatured);
  await event.save();

  await Promise.all([clearEventsCache(), clearSingleEventCache(event._id)]);

  await recordAudit({
    req,
    action: "event.status",
    entityType: "event",
    entityId: String(event._id),
    message: `Event “${event.name}” set to ${event.status}`,
    metadata: { before, after: { status: event.status, isFeatured: event.isFeatured }, note: note || "" },
  });

  return {
    id: String(event._id),
    status: event.status,
    isFeatured: Boolean(event.isFeatured),
  };
}

export async function deleteEvent(req, eventId, { reason } = {}) {
  const id = oid(eventId, "event id");
  const event = await Event.findOne({ _id: id, deletedAt: null });
  if (!event) throw new AppError("Event not found", 404);

  event.deletedAt = new Date();
  await event.save();
  await Promise.all([clearEventsCache(), clearSingleEventCache(event._id)]);

  await recordAudit({
    req,
    action: "event.delete",
    entityType: "event",
    entityId: String(event._id),
    message: `Event “${event.name}” deleted (soft)`,
    metadata: { reason: reason || "" },
  });

  return { deleted: true, id: String(event._id) };
}

/* ── organizers ───────────────────────────────────────────────────────── */

export async function verifyOrganizer(req, adminId, { verified, note } = {}) {
  const id = oid(adminId, "organizer id");
  if (typeof verified !== "boolean") {
    throw new AppError("verified must be true or false", 400);
  }

  const profile = await AdminProfile.findById(id);
  if (!profile) throw new AppError("Organizer not found", 404);

  const before = {
    isVerified: profile.isVerified,
    verificationNote: profile.verificationNote,
    rejectionReason: profile.rejectionReason,
  };

  profile.isVerified = verified;
  profile.verifiedAt = verified ? new Date() : null;
  profile.verifiedBy = verified ? actor(req).id || null : null;
  profile.verificationNote = note || "";
  profile.rejectionReason = verified ? "" : note || "";
  await profile.save();

  await recordAudit({
    req,
    action: verified ? "organizer.verify" : "organizer.reject",
    entityType: "organizer",
    entityId: String(profile._id),
    message: `${profile.organizationName || "Organizer"} ${verified ? "verified" : "rejected"}`,
    metadata: { before, after: { isVerified: verified }, note: note || "" },
  });

  return { id: String(profile._id), verified: Boolean(profile.isVerified) };
}

export async function updateOrganizerStatus(req, adminId, { status } = {}) {
  const id = oid(adminId, "organizer id");
  if (!USER_STATUSES.includes(status)) {
    throw new AppError("Invalid account status", 400);
  }

  const profile = await AdminProfile.findById(id).lean();
  if (!profile) throw new AppError("Organizer not found", 404);

  const user = await UserModel.findById(profile.userId);
  if (!user) throw new AppError("Organizer account not found", 404);
  if (String(user._id) === String(actor(req).id)) {
    throw new AppError("You cannot change your own account status", 400);
  }

  const before = user.status;
  user.status = status;
  if (status !== "active") user.refreshTokens = [];
  await user.save();

  await recordAudit({
    req,
    action: "organizer.status",
    entityType: "organizer",
    entityId: String(profile._id),
    message: `${profile.organizationName || "Organizer"} account set to ${status}`,
    metadata: { before, after: status, userId: String(user._id) },
  });

  return { id: String(profile._id), userStatus: user.status };
}

export async function updateOrganizerCommission(req, adminId, { rate } = {}) {
  const id = oid(adminId, "organizer id");
  const profile = await AdminProfile.findById(id);
  if (!profile) throw new AppError("Organizer not found", 404);

  let nextRate = null;
  if (rate !== null && rate !== undefined && rate !== "") {
    const parsed = Number(rate);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      throw new AppError("Commission rate must be between 0 and 1", 400);
    }
    nextRate = parsed;
  }

  const before = profile.commissionRate;
  profile.commissionRate = nextRate;
  await profile.save();

  await recordAudit({
    req,
    action: "organizer.commission",
    entityType: "organizer",
    entityId: String(profile._id),
    message: `Commission override ${nextRate === null ? "cleared" : `${Math.round(nextRate * 100)}%`} for ${profile.organizationName}`,
    metadata: { before, after: nextRate },
  });

  return { id: String(profile._id), commissionRate: profile.commissionRate };
}

/* ── users ────────────────────────────────────────────────────────────── */

async function activeSuperAdminCount(excludeUserId = null) {
  const query = { role: "super_admin", status: "active", deletedAt: null };
  if (excludeUserId) query._id = { $ne: excludeUserId };
  return UserModel.countDocuments(query);
}

export async function updateUser(req, userId, { status, role } = {}) {
  const id = oid(userId, "user id");
  const user = await UserModel.findById(id);
  if (!user) throw new AppError("User not found", 404);
  if (String(user._id) === String(actor(req).id)) {
    throw new AppError("You cannot change your own role or status", 400);
  }

  if (role === undefined && status === undefined) {
    throw new AppError("Nothing to update", 400);
  }
  if (role !== undefined && !ROLES.includes(role)) {
    throw new AppError("Invalid role", 400);
  }
  if (status !== undefined && !USER_STATUSES.includes(status)) {
    throw new AppError("Invalid account status", 400);
  }

  const before = { role: user.role, status: user.status };

  if (role !== undefined && role !== user.role) {
    if (user.role === "super_admin" && role !== "super_admin") {
      const remaining = await activeSuperAdminCount(user._id);
      if (remaining < 1) {
        throw new AppError("You cannot remove the last active super admin", 400);
      }
    }
    user.role = role;
  }

  if (status !== undefined && status !== user.status) {
    if (user.role === "super_admin" && status !== "active") {
      const remaining = await activeSuperAdminCount(user._id);
      if (remaining < 1) {
        throw new AppError("You cannot disable the last active super admin", 400);
      }
    }
    user.status = status;
    if (status !== "active") user.refreshTokens = [];
  }

  await user.save();

  await recordAudit({
    req,
    action: "user.update",
    entityType: "user",
    entityId: String(user._id),
    message: `Account ${user.email} updated`,
    metadata: { before, after: { role: user.role, status: user.status } },
  });

  return { id: String(user._id), role: user.role, status: user.status };
}

export async function deleteUser(req, userId, { reason } = {}) {
  const id = oid(userId, "user id");
  const user = await UserModel.findById(id);
  if (!user) throw new AppError("User not found", 404);
  if (String(user._id) === String(actor(req).id)) {
    throw new AppError("You cannot delete your own account", 400);
  }
  if (user.role === "super_admin") {
    const remaining = await activeSuperAdminCount(user._id);
    if (remaining < 1) {
      throw new AppError("You cannot delete the last active super admin", 400);
    }
  }

  user.deletedAt = new Date();
  user.status = "banned";
  user.refreshTokens = [];
  await user.save();

  await recordAudit({
    req,
    action: "user.delete",
    entityType: "user",
    entityId: String(user._id),
    message: `Account ${user.email} soft-deleted`,
    metadata: { reason: reason || "" },
  });

  return { deleted: true, id: String(user._id) };
}

/* ── orders ───────────────────────────────────────────────────────────── */

export async function markOrderPaid(req, orderId, { note, reference } = {}) {
  const id = oid(orderId, "order id");
  const order = await loadOrder(id);
  if (order.status !== "pending") {
    throw new AppError(
      `Only a pending order can be marked paid (current status: ${order.status}).`,
      409,
    );
  }
  if (order.expiresAt && new Date(order.expiresAt).getTime() < Date.now()) {
    throw new AppError("This order has expired; the buyer must rebook.", 400);
  }

  const setting = await getPlatformSetting();
  const commission = await commissionFor(order, setting);
  const update = {
    status: "paid",
    isVerified: true,
    commissionRate: commission.rate,
    commissionAmount: commission.amount,
  };
  if (reference) update.referenceId = String(reference).trim();

  let updated;
  try {
    updated = await UserTicketModel.findOneAndUpdate(
      { _id: order._id, status: "pending" },
      { $set: update },
      { new: true, runValidators: true },
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("That receipt reference is already used.", 409);
    }
    throw error;
  }
  if (!updated) {
    throw new AppError("This order is no longer pending.", 409);
  }

  await refreshOrderCaches(order);
  await recordAudit({
    req,
    action: "order.mark_paid",
    entityType: "order",
    entityId: String(order._id),
    message: `Order ${order.orderNo} marked paid manually`,
    metadata: {
      before: order.status,
      after: "paid",
      amount: order.totalAmount,
      commissionRate: commission.rate,
      commissionAmount: commission.amount,
      note: note || "",
      reference: reference || "",
    },
  });

  return {
    id: String(updated._id),
    orderNo: updated.orderNo,
    status: updated.status,
    commissionAmount: updated.commissionAmount,
  };
}

export async function cancelOrder(req, orderId, { reason } = {}) {
  const id = oid(orderId, "order id");
  const order = await loadOrder(id);
  if (order.status !== "pending") {
    throw new AppError(
      `Only a pending order can be cancelled. Use refund for a paid order.`,
      409,
    );
  }

  const updated = await UserTicketModel.findOneAndUpdate(
    { _id: order._id, status: "pending" },
    { $set: { status: "cancelled" } },
    { new: true },
  );
  if (!updated) throw new AppError("This order is no longer pending.", 409);

  if (order.ticketId?._id) {
    await TicketModel.updateOne(
      { _id: order.ticketId._id },
      { $inc: { availableQuantity: Number(order.quantity) || 0 } },
    );
  }

  await refreshOrderCaches(order);
  await Promise.all([
    order.ticketId?.eventId?._id
      ? clearSingleEventCache(order.ticketId.eventId._id)
      : Promise.resolve(),
    clearEventsCache(),
  ]);

  await recordAudit({
    req,
    action: "order.cancel",
    entityType: "order",
    entityId: String(order._id),
    message: `Order ${order.orderNo} cancelled`,
    metadata: { before: "pending", after: "cancelled", reason: reason || "" },
  });

  return { id: String(updated._id), status: updated.status };
}

export async function refundOrder(req, orderId, { amount, reason, returnSeats } = {}) {
  const id = oid(orderId, "order id");
  const order = await loadOrder(id);
  if (order.status !== "paid") {
    throw new AppError(
      `Only a paid order can be refunded (current status: ${order.status}).`,
      409,
    );
  }
  assertEventNotStarted(order, "refunding");

  const requested =
    amount === undefined || amount === null || amount === ""
      ? Number(order.totalAmount)
      : Number(amount);
  if (!Number.isFinite(requested) || requested <= 0) {
    throw new AppError("Refund amount must be greater than zero", 400);
  }
  if (requested > Number(order.totalAmount)) {
    throw new AppError("Refund amount cannot exceed the order total", 400);
  }

  const updated = await UserTicketModel.findOneAndUpdate(
    { _id: order._id, status: "paid" },
    {
      $set: {
        status: "refunded",
        refundedAt: new Date(),
        refundedBy: actor(req).id || null,
        refundAmount: round2(requested),
        refundReason: reason || "",
      },
    },
    { new: true },
  );
  if (!updated) {
    throw new AppError("This order is no longer refundable.", 409);
  }

  let seatsReturned = 0;
  if (returnSeats && order.ticketId?._id) {
    const tier = await TicketModel.findById(order.ticketId._id)
      .select("availableQuantity totalQuantity")
      .lean();
    const quantity = Number(order.quantity) || 0;
    if (
      tier &&
      Number(tier.availableQuantity) + quantity <= Number(tier.totalQuantity)
    ) {
      await TicketModel.updateOne(
        { _id: tier._id },
        { $inc: { availableQuantity: quantity } },
      );
      seatsReturned = quantity;
    }
  }

  await refreshOrderCaches(order);
  if (order.ticketId?.eventId?._id) {
    await clearSingleEventCache(order.ticketId.eventId._id);
  }

  await recordAudit({
    req,
    action: "order.refund",
    entityType: "order",
    entityId: String(order._id),
    message: `Order ${order.orderNo} refunded ${round2(requested)}`,
    metadata: {
      before: "paid",
      after: "refunded",
      amount: round2(requested),
      returnSeats: Boolean(returnSeats),
      seatsReturned,
      reason: reason || "",
    },
  });

  return {
    id: String(updated._id),
    status: updated.status,
    refundAmount: round2(requested),
    seatsReturned,
  };
}

export async function checkInOrder(req, orderId) {
  const id = oid(orderId, "order id");
  const order = await loadOrder(id);
  if (order.status !== "paid" || !order.isVerified) {
    throw new AppError("Only a paid, verified order can be checked in.", 400);
  }
  if (order.checked?.checkedIn) {
    throw new AppError("This order is already checked in.", 409);
  }

  const updated = await UserTicketModel.findOneAndUpdate(
    {
      _id: order._id,
      status: "paid",
      isVerified: true,
      "checked.checkedIn": false,
    },
    {
      $set: {
        "checked.checkedIn": true,
        "checked.checkedInAt": new Date(),
        "checked.checkedInBy": actor(req).id || null,
      },
    },
    { new: true },
  );
  if (!updated) throw new AppError("This order could not be checked in.", 409);

  await refreshOrderCaches(order);
  await logManualCheckIn(req, order);
  await recordAudit({
    req,
    action: "order.check_in",
    entityType: "order",
    entityId: String(order._id),
    message: `Order ${order.orderNo} checked in manually`,
    metadata: { before: false, after: true },
  });

  return { id: String(updated._id), checkedIn: true };
}

export async function undoOrderCheckIn(req, orderId, { reason } = {}) {
  const id = oid(orderId, "order id");
  const order = await loadOrder(id);
  if (!order.checked?.checkedIn) {
    throw new AppError("This order is not checked in.", 409);
  }

  const updated = await UserTicketModel.findOneAndUpdate(
    { _id: order._id, "checked.checkedIn": true },
    {
      $set: {
        "checked.checkedIn": false,
        "checked.checkedInAt": null,
        "checked.checkedInBy": null,
      },
    },
    { new: true },
  );
  if (!updated) throw new AppError("This order is no longer checked in.", 409);

  await refreshOrderCaches(order);
  await recordAudit({
    req,
    action: "order.undo_check_in",
    entityType: "order",
    entityId: String(order._id),
    message: `Check-in undone for ${order.orderNo}`,
    metadata: { before: true, after: false, reason: reason || "" },
  });

  return { id: String(updated._id), checkedIn: false };
}
