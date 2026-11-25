import mongoose from "mongoose";
import { ReferralModel } from "../models/referral.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { ProfileModel } from "../models/profile.model.js";

export class ReferralError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/;

/** Upper-case, trimmed code, or "" when it is not a usable code. */
export function normalizeCode(input) {
  const code = String(input ?? "").trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : "";
}

/** A starting suggestion for the code, from the promoter's name. */
export function suggestCode(name) {
  const base = String(name ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
  return base.length >= 3 ? base : "";
}

const sameId = (a, b) => String(a) === String(b);

/** Totals for a set of paid orders: tickets, orders, distinct buyers, money. */
export function summarizeReferralOrders(orders) {
  const buyers = new Set(orders.map((o) => String(o.userId)));
  return {
    tickets: orders.reduce((n, o) => n + (o.quantity || 0), 0),
    orders: orders.length,
    buyers: buyers.size,
    revenue: orders.reduce((n, o) => n + (o.totalAmount || 0), 0),
  };
}

const EMPTY_STATS = { tickets: 0, orders: 0, buyers: 0, revenue: 0 };

async function adminOwnsEvent(adminId, eventId) {
  const event = await Event.findById(eventId).select("adminId deletedAt").lean();
  return Boolean(event && !event.deletedAt && sameId(event.adminId, adminId));
}

export async function createReferral(adminId, { name, code, eventId }) {
  const cleanName = String(name ?? "").trim();
  if (!cleanName) throw new ReferralError(400, "Enter the promoter's name");
  const cleanCode = normalizeCode(code || suggestCode(cleanName));
  if (!cleanCode) {
    throw new ReferralError(
      400,
      "Code must be 3-20 letters, numbers, - or _",
    );
  }
  let scopedEvent = null;
  if (eventId) {
    if (
      !mongoose.isValidObjectId(eventId) ||
      !(await adminOwnsEvent(adminId, eventId))
    ) {
      throw new ReferralError(400, "Choose one of your own events");
    }
    scopedEvent = eventId;
  }
  try {
    return await ReferralModel.create({
      adminId,
      name: cleanName,
      code: cleanCode,
      eventId: scopedEvent,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ReferralError(409, "That code is already taken, try another");
    }
    throw error;
  }
}

export async function setReferralActive(adminId, id, isActive) {
  if (!mongoose.isValidObjectId(id)) throw new ReferralError(404, "Not found");
  const updated = await ReferralModel.findOneAndUpdate(
    { _id: id, adminId },
    { isActive: Boolean(isActive) },
    { new: true },
  );
  if (!updated) throw new ReferralError(404, "Not found");
  return updated;
}

export async function listReferrals(adminId) {
  const referrals = await ReferralModel.find({ adminId })
    .sort({ createdAt: -1 })
    .populate({ path: "eventId", select: "name" })
    .lean();
  if (referrals.length === 0) return [];

  const orders = await UserTicketModel.find({
    "referral.referralId": { $in: referrals.map((r) => r._id) },
    status: "paid",
  })
    .select("userId quantity totalAmount referral.referralId")
    .lean();

  const byReferral = new Map();
  for (const order of orders) {
    const key = String(order.referral.referralId);
    byReferral.set(key, [...(byReferral.get(key) || []), order]);
  }

  return referrals.map((r) => ({
    _id: r._id,
    name: r.name,
    code: r.code,
    isActive: r.isActive,
    event: r.eventId ? { _id: r.eventId._id, name: r.eventId.name } : null,
    createdAt: r.createdAt,
    stats: byReferral.has(String(r._id))
      ? summarizeReferralOrders(byReferral.get(String(r._id)))
      : EMPTY_STATS,
  }));
}

export async function referralDetail(adminId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ReferralError(404, "Not found");
  const referral = await ReferralModel.findOne({ _id: id, adminId })
    .populate({ path: "eventId", select: "name" })
    .lean();
  if (!referral) throw new ReferralError(404, "Not found");

  const orders = await UserTicketModel.find({
    "referral.referralId": referral._id,
    status: "paid",
  })
    .sort({ purchasedAt: -1 })
    .limit(5000)
    .select("userId ticketId quantity totalAmount purchasedAt")
    .lean();

  const tickets = await TicketModel.find({
    _id: { $in: orders.map((o) => o.ticketId) },
  })
    .select("eventId")
    .lean();
  const eventOfTicket = new Map(tickets.map((t) => [String(t._id), t.eventId]));
  const events = await Event.find({
    _id: { $in: [...new Set(tickets.map((t) => String(t.eventId)))] },
  })
    .select("name")
    .lean();
  const eventName = new Map(events.map((e) => [String(e._id), e.name]));

  const perEvent = new Map();
  for (const order of orders) {
    const eventKey = String(eventOfTicket.get(String(order.ticketId)) ?? "");
    perEvent.set(eventKey, [...(perEvent.get(eventKey) || []), order]);
  }

  const recent = orders.slice(0, 15);
  const profiles = await ProfileModel.find({
    userId: { $in: recent.map((o) => o.userId) },
  })
    .select("userId fullName")
    .lean();
  const buyerName = new Map(profiles.map((p) => [String(p.userId), p.fullName]));

  return {
    referral: {
      _id: referral._id,
      name: referral.name,
      code: referral.code,
      isActive: referral.isActive,
      event: referral.eventId
        ? { _id: referral.eventId._id, name: referral.eventId.name }
        : null,
    },
    stats: orders.length ? summarizeReferralOrders(orders) : EMPTY_STATS,
    byEvent: [...perEvent.entries()].map(([eventKey, group]) => ({
      eventId: eventKey,
      eventName: eventName.get(eventKey) || "Event",
      ...summarizeReferralOrders(group),
    })),
    // Buyer name only: no phone or email is shared with the promoter side.
    recentSales: recent.map((o) => ({
      buyer: buyerName.get(String(o.userId)) || "Guest",
      eventName:
        eventName.get(String(eventOfTicket.get(String(o.ticketId)))) || "Event",
      quantity: o.quantity,
      purchasedAt: o.purchasedAt,
    })),
  };
}

/**
 * The active referral a code points to for this event, or null when the
 * code is unknown, switched off, belongs to another organizer, or is limited
 * to a different event.
 */
export async function resolveReferral(code, eventId) {
  const clean = normalizeCode(code);
  if (!clean || !mongoose.isValidObjectId(eventId)) return null;
  const referral = await ReferralModel.findOne({
    code: clean,
    isActive: true,
  }).lean();
  if (!referral) return null;
  const event = await Event.findById(eventId).select("adminId").lean();
  if (!event || !sameId(event.adminId, referral.adminId)) return null;
  if (referral.eventId && !sameId(referral.eventId, eventId)) return null;
  return referral;
}
