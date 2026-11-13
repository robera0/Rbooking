import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { ScanLog } from "../models/scanLog.model.js";
import { PlatformSetting } from "../models/platformSetting.model.js";
import redisClient from "../config/redis.js";
import { listAuditLogs } from "../service/superAdminConsole.service.js";
import {
  cancelOrder,
  checkInOrder,
  deleteEvent,
  deleteUser,
  markOrderPaid,
  refundOrder,
  undoOrderCheckIn,
  updateEventStatus,
  updateOrganizerCommission,
  updateOrganizerStatus,
  updateUser,
  verifyOrganizer,
} from "../service/superAdminActions.service.js";

let mongo;
let seeded;
let req;

const models = [
  Event,
  TicketModel,
  UserModel,
  ProfileModel,
  AdminProfile,
  UserTicketModel,
  AuditLog,
  ScanLog,
  PlatformSetting,
];

before(async () => {
  mongo = await startTestMongo();
});

after(async () => {
  await mongo.stop();
  // The action service imports the shared Redis client; close it so the
  // test process can exit instead of waiting on the open socket.
  await redisClient.quit().catch(() => {});
});

beforeEach(async () => {
  await Promise.all(models.map((model) => model.deleteMany({})));
  seeded = await seed();
  req = {
    user: {
      id: String(seeded.superAdmin._id),
      email: seeded.superAdmin.email,
      role: "super_admin",
    },
    ip: "127.0.0.1",
    headers: {},
  };
});

const rejects = (promise, status) =>
  assert.rejects(promise, (error) => error.statusCode === status);

async function seed() {
  const superAdmin = await UserModel.create({
    email: "root@example.com",
    password: "x",
    role: "super_admin",
  });
  const organizerUser = await UserModel.create({
    email: "org@example.com",
    password: "x",
    role: "admin",
    refreshTokens: [{ token: "live-refresh-token" }],
  });
  const organizer = await AdminProfile.create({
    userId: organizerUser._id,
    firstName: "Org",
    lastName: "One",
    email: "org@example.com",
    phone: "+251900000000",
    organizationName: "Org One",
    isVerified: false,
  });
  const buyer = await UserModel.create({
    email: "buyer@example.com",
    password: "x",
    refreshTokens: [{ token: "buyer-refresh-token" }],
  });
  await ProfileModel.create({
    userId: buyer._id,
    fullName: "Buyer One",
    phone: "+251911111111",
  });

  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const event = await Event.create({
    type: "generic",
    name: "Action Test Event",
    adminId: organizer._id,
    status: "published",
    dates: { start: { dateTime: startsAt }, timezone: "Africa/Addis_Ababa" },
    links: { venues: { name: "Venue", city: "Addis Ababa" } },
  });
  const draft = await Event.create({
    type: "generic",
    name: "Draft Action Event",
    adminId: organizer._id,
    status: "draft",
    dates: { start: { dateTime: startsAt }, timezone: "Africa/Addis_Ababa" },
    links: { venues: { name: "Draft Venue", city: "Addis Ababa" } },
  });
  const tier = await TicketModel.create({
    eventId: event._id,
    name: "VIP",
    price: 500,
    totalQuantity: 100,
    availableQuantity: 97,
  });
  const paid = await UserTicketModel.create({
    userId: buyer._id,
    ticketId: tier._id,
    ticketType: "VIP",
    orderNo: "ORD-ACTION-PAID",
    isVerified: true,
    quantity: 2,
    totalAmount: 1000,
    status: "paid",
    purchasedAt: new Date(),
  });
  const pending = await UserTicketModel.create({
    userId: buyer._id,
    ticketId: tier._id,
    ticketType: "VIP",
    orderNo: "ORD-ACTION-PENDING",
    isVerified: false,
    quantity: 1,
    totalAmount: 500,
    status: "pending",
    expiresAt: new Date(Date.now() + 20 * 60 * 1000),
  });

  return {
    superAdmin,
    organizerUser,
    organizer,
    buyer,
    event,
    draft,
    tier,
    paid,
    pending,
  };
}

test("marking a pending order paid snapshots commission and audits it", async () => {
  const result = await markOrderPaid(req, String(seeded.pending._id), {
    note: "Bank transfer confirmed",
  });
  assert.equal(result.status, "paid");

  const stored = await UserTicketModel.findById(seeded.pending._id).lean();
  assert.equal(stored.status, "paid");
  assert.equal(stored.isVerified, true);
  assert.equal(stored.commissionRate, 0.1);
  assert.equal(stored.commissionAmount, 50);

  const audit = await AuditLog.findOne({ action: "order.mark_paid" }).lean();
  assert.ok(audit);
  assert.equal(audit.entityId, String(seeded.pending._id));
});

test("marking an already-paid order paid is refused", async () => {
  await rejects(markOrderPaid(req, String(seeded.paid._id)), 409);
});

test("cancelling a pending order releases its seat", async () => {
  const before = await TicketModel.findById(seeded.tier._id).lean();
  const result = await cancelOrder(req, String(seeded.pending._id), {
    reason: "Buyer changed their mind",
  });
  assert.equal(result.status, "cancelled");
  const after = await TicketModel.findById(seeded.tier._id).lean();
  assert.equal(after.availableQuantity, before.availableQuantity + 1);
});

test("refunding a paid order records the amount and can return seats", async () => {
  const before = await TicketModel.findById(seeded.tier._id).lean();
  const result = await refundOrder(req, String(seeded.paid._id), {
    reason: "Event change",
    returnSeats: true,
  });
  assert.equal(result.status, "refunded");
  assert.equal(result.refundAmount, 1000);
  assert.equal(result.seatsReturned, 2);

  const stored = await UserTicketModel.findById(seeded.paid._id).lean();
  assert.equal(stored.status, "refunded");
  assert.equal(stored.refundAmount, 1000);
  assert.equal(stored.refundReason, "Event change");

  const after = await TicketModel.findById(seeded.tier._id).lean();
  assert.equal(after.availableQuantity, before.availableQuantity + 2);
  await rejects(refundOrder(req, String(seeded.paid._id)), 409);
});

test("partial refunds are capped at the order total", async () => {
  const result = await refundOrder(req, String(seeded.paid._id), {
    amount: 400,
    reason: "Partial goodwill",
  });
  assert.equal(result.refundAmount, 400);
  await rejects(
    refundOrder(req, String(seeded.pending._id), { amount: 400 }),
    409,
  );
});

test("refunds are refused after the event has started", async () => {
  const pastEvent = await Event.create({
    type: "generic",
    name: "Past Event",
    adminId: seeded.organizer._id,
    status: "published",
    dates: { start: { dateTime: new Date(Date.now() - 60 * 1000) } },
    links: { venues: { name: "Past Venue" } },
  });
  const pastTier = await TicketModel.create({
    eventId: pastEvent._id,
    name: "Past Tier",
    price: 100,
    totalQuantity: 10,
    availableQuantity: 9,
  });
  const pastOrder = await UserTicketModel.create({
    userId: seeded.buyer._id,
    ticketId: pastTier._id,
    orderNo: "ORD-PAST",
    isVerified: true,
    quantity: 1,
    totalAmount: 100,
    status: "paid",
  });
  await rejects(refundOrder(req, String(pastOrder._id)), 400);
});

test("manual check-in records a scan and undo clears it", async () => {
  const result = await checkInOrder(req, String(seeded.paid._id));
  assert.equal(result.checkedIn, true);
  const stored = await UserTicketModel.findById(seeded.paid._id).lean();
  assert.equal(stored.checked.checkedIn, true);
  assert.ok(await ScanLog.findOne({ orderNo: "ORD-ACTION-PAID" }).lean());
  await rejects(checkInOrder(req, String(seeded.paid._id)), 409);

  const undone = await undoOrderCheckIn(req, String(seeded.paid._id), {
    reason: "Wrong gate",
  });
  assert.equal(undone.checkedIn, false);
  const after = await UserTicketModel.findById(seeded.paid._id).lean();
  assert.equal(after.checked.checkedIn, false);
});

test("publishing needs a tier, and status/feature/delete are audited", async () => {
  await rejects(
    updateEventStatus(req, String(seeded.draft._id), { status: "published" }),
    400,
  );
  await TicketModel.create({
    eventId: seeded.draft._id,
    name: "Draft Tier",
    price: 100,
    totalQuantity: 10,
    availableQuantity: 10,
  });

  const published = await updateEventStatus(req, String(seeded.draft._id), {
    status: "published",
    isFeatured: true,
  });
  assert.equal(published.status, "published");
  assert.equal(published.isFeatured, true);

  await deleteEvent(req, String(seeded.draft._id), { reason: "Duplicate" });
  const deleted = await Event.findById(seeded.draft._id).lean();
  assert.ok(deleted.deletedAt);
  assert.equal(await AuditLog.countDocuments({ action: "event.delete" }), 1);
});

test("organizer verification, status and commission overrides work", async () => {
  await verifyOrganizer(req, String(seeded.organizer._id), {
    verified: true,
    note: "Documents checked",
  });
  const verified = await AdminProfile.findById(seeded.organizer._id).lean();
  assert.equal(verified.isVerified, true);
  assert.ok(verified.verifiedAt);

  await updateOrganizerStatus(req, String(seeded.organizer._id), {
    status: "suspended",
  });
  const suspended = await UserModel.findById(seeded.organizerUser._id).lean();
  assert.equal(suspended.status, "suspended");
  assert.equal(suspended.refreshTokens.length, 0);

  await updateOrganizerCommission(req, String(seeded.organizer._id), {
    rate: 0.2,
  });
  const commissioned = await AdminProfile.findById(
    seeded.organizer._id,
  ).lean();
  assert.equal(commissioned.commissionRate, 0.2);

  await rejects(
    updateOrganizerCommission(req, String(seeded.organizer._id), { rate: 1.4 }),
    400,
  );
});

test("user status, role and soft delete are guarded", async () => {
  await updateUser(req, String(seeded.buyer._id), { status: "suspended" });
  const suspended = await UserModel.findById(seeded.buyer._id).lean();
  assert.equal(suspended.status, "suspended");
  assert.equal(suspended.refreshTokens.length, 0);

  await updateUser(req, String(seeded.buyer._id), {
    role: "club_owner",
    status: "active",
  });
  const promoted = await UserModel.findById(seeded.buyer._id).lean();
  assert.equal(promoted.role, "club_owner");

  await rejects(
    updateUser(req, String(seeded.superAdmin._id), { role: "user" }),
    400,
  );
  await rejects(deleteUser(req, String(seeded.superAdmin._id)), 400);

  await deleteUser(req, String(seeded.buyer._id), { reason: "Spam" });
  const deleted = await UserModel.findById(seeded.buyer._id).lean();
  assert.ok(deleted.deletedAt);
  assert.equal(deleted.status, "banned");
});

test("audit rows can be filtered by entity id", async () => {
  await markOrderPaid(req, String(seeded.pending._id), {});
  const result = await listAuditLogs({
    entity: "order",
    entityId: String(seeded.pending._id),
    page: 1,
    limit: 20,
  });
  assert.equal(result.total, 1);
  assert.equal(result.rows[0].action, "order.mark_paid");
});
