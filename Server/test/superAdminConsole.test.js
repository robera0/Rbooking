import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { startTestMongo } from "./helpers/testMongo.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { ScanLog } from "../models/scanLog.model.js";
import { Payout } from "../models/payout.model.js";
import { PlatformSetting } from "../models/platformSetting.model.js";
import redisClient from "../config/redis.js";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const { default: SuperAdminRouter } = await import(
  "../routes/superAdmin.routes.js"
);

let server;
let base;
let mongo;
let seeded;

const models = [
  Event,
  TicketModel,
  UserModel,
  ProfileModel,
  AdminProfile,
  UserTicketModel,
  AuditLog,
  ScanLog,
  Payout,
  PlatformSetting,
];

before(async () => {
  mongo = await startTestMongo();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth/super_admin", SuperAdminRouter);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/auth/super_admin`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongo.stop();
  // The router now also loads the action service, which opens Redis.
  await redisClient.quit().catch(() => {});
});

beforeEach(async () => {
  await Promise.all(models.map((model) => model.deleteMany({})));
  seeded = await seed();
});

const get = async (path) => {
  const token = jwt.sign(
    {
      id: String(seeded.superAdmin._id),
      email: seeded.superAdmin.email,
      role: "super_admin",
    },
    process.env.ACCESS_TOKEN_SECRET,
  );
  const response = await fetch(`${base}${path}`, {
    headers: { cookie: `accessToken=${token}` },
  });
  return { status: response.status, body: await response.json() };
};

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
  });
  await ProfileModel.create({
    userId: buyer._id,
    fullName: "Buyer One",
    phone: "+251911111111",
  });

  const event = await Event.create({
    type: "generic",
    name: "Test Event",
    adminId: organizer._id,
    status: "published",
    dates: {
      start: {
        dateTime: new Date("2026-11-01T17:00:00Z"),
        timezone: "Africa/Addis_Ababa",
      },
    },
    links: { venues: { name: "Venue", city: "Addis Ababa" } },
    pictures: ["poster.jpg"],
  });
  const tier = await TicketModel.create({
    eventId: event._id,
    name: "VIP",
    price: 500,
    totalQuantity: 100,
    availableQuantity: 98,
  });

  const paid = await UserTicketModel.create({
    userId: buyer._id,
    ticketId: tier._id,
    ticketType: "VIP",
    orderNo: "ORD-PAID",
    isVerified: true,
    quantity: 2,
    totalAmount: 1000,
    status: "paid",
    purchasedAt: new Date(),
  });
  await UserTicketModel.create({
    userId: buyer._id,
    ticketId: tier._id,
    ticketType: "VIP",
    orderNo: "ORD-PENDING",
    isVerified: false,
    quantity: 1,
    totalAmount: 500,
    status: "pending",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });
  await UserTicketModel.create({
    userId: buyer._id,
    ticketId: tier._id,
    ticketType: "VIP",
    orderNo: "ORD-REFUND",
    isVerified: true,
    quantity: 1,
    totalAmount: 300,
    status: "refunded",
    refundAmount: 300,
    refundedAt: new Date(),
  });

  await Payout.create({
    organizerId: organizer._id,
    amount: 100,
    status: "paid",
    method: "Telebirr",
  });
  await ScanLog.create({
    orderId: paid._id,
    orderNo: paid.orderNo,
    eventId: event._id,
    eventName: event.name,
    buyerName: "Buyer One",
    tierName: "VIP",
    scannerId: superAdmin._id,
    scannerEmail: superAdmin.email,
    result: "checked_in",
  });
  await AuditLog.create({
    actorId: superAdmin._id,
    actorEmail: superAdmin.email,
    actorRole: "super_admin",
    action: "ticket.scan",
    entityType: "order",
    entityId: paid.orderNo,
    message: "Checked in ORD-PAID",
  });

  return { superAdmin, organizerUser, organizer, buyer, event, tier, paid };
}

test("me returns the signed-in super admin", async () => {
  const { status, body } = await get("/me");
  assert.equal(status, 200);
  assert.equal(body.data.role, "super_admin");
  assert.equal(body.data.email, "root@example.com");
});

test("overview totals paid, refunded, commission and payout due", async () => {
  const { status, body } = await get("/overview?range=30d");
  assert.equal(status, 200);
  assert.equal(body.data.kpis.revenue.gross, 1000);
  assert.equal(body.data.kpis.revenue.refunded, 300);
  assert.equal(body.data.kpis.revenue.commission, 100);
  assert.equal(body.data.kpis.revenue.net, 600);
  assert.equal(body.data.kpis.revenue.paidOut, 100);
  assert.equal(body.data.kpis.revenue.payoutDue, 500);
  assert.equal(body.data.kpis.orders.pending, 1);
  assert.equal(body.data.kpis.orders.expiringSoon, 1);
});

test("events list carries organizer, sales and revenue", async () => {
  const { status, body } = await get("/events");
  assert.equal(status, 200);
  assert.equal(body.meta.total, 1);
  assert.equal(body.data[0].name, "Test Event");
  assert.equal(body.data[0].organizer.name, "Org One");
  assert.equal(body.data[0].sold, 2);
  assert.equal(body.data[0].gross, 1000);
});

test("event detail carries tiers and stats", async () => {
  const { status, body } = await get(`/events/${seeded.event._id}`);
  assert.equal(status, 200);
  assert.equal(body.data.event.name, "Test Event");
  assert.equal(body.data.stats.gross, 1000);
  assert.equal(body.data.stats.pending, 1);
  assert.equal(body.data.tiers[0].name, "VIP");
  assert.equal(body.data.tiers[0].sold, 2);
  assert.equal(body.data.recentOrders.length, 3);
});

test("organizers list shows gross, commission, refunds and balance", async () => {
  const { status, body } = await get("/organizers");
  assert.equal(status, 200);
  assert.equal(body.meta.total, 1);
  assert.equal(body.data[0].organizationName, "Org One");
  assert.equal(body.data[0].gross, 1000);
  assert.equal(body.data[0].commission, 100);
  assert.equal(body.data[0].refunded, 300);
  assert.equal(body.data[0].paidOut, 100);
  assert.equal(body.data[0].balance, 500);
});

test("organizer detail reports the same balance", async () => {
  const { status, body } = await get(`/organizers/${seeded.organizer._id}`);
  assert.equal(status, 200);
  assert.equal(body.data.stats.gross, 1000);
  assert.equal(body.data.stats.refunded, 300);
  assert.equal(body.data.stats.paidOut, 100);
  assert.equal(body.data.stats.balance, 500);
  assert.equal(body.data.recentOrders.length, 3);
});

test("users list is searchable and carries spend", async () => {
  const { status, body } = await get("/users?role=user&q=Buyer");
  assert.equal(status, 200);
  assert.equal(body.meta.total, 1);
  assert.equal(body.data[0].email, "buyer@example.com");
  assert.equal(body.data[0].orders, 1);
  assert.equal(body.data[0].spend, 1000);
});

test("user detail returns profile and recent orders", async () => {
  const { status, body } = await get(`/users/${seeded.buyer._id}`);
  assert.equal(status, 200);
  assert.equal(body.data.user.fullName, "Buyer One");
  assert.equal(body.data.stats.spend, 1000);
  assert.equal(body.data.recentOrders.length, 3);
});

test("orders list filters by status and totals the matched rows", async () => {
  const all = await get("/orders");
  assert.equal(all.status, 200);
  assert.equal(all.body.meta.total, 3);
  assert.equal(all.body.meta.totals.amount, 1800);

  const paid = await get("/orders?status=paid");
  assert.equal(paid.body.meta.total, 1);
  assert.equal(paid.body.meta.totals.amount, 1000);
  assert.equal(paid.body.data[0].buyer.name, "Buyer One");
  assert.equal(paid.body.data[0].event.name, "Test Event");
});

test("order detail returns the order and timeline", async () => {
  const { status, body } = await get(`/orders/${seeded.paid._id}`);
  assert.equal(status, 200);
  assert.equal(body.data.order.orderNo, "ORD-PAID");
  assert.equal(body.data.order.amount, 1000);
  assert.ok(Array.isArray(body.data.timeline));
});

test("revenue and per-organizer revenue reconcile", async () => {
  const revenue = await get("/revenue?range=30d");
  assert.equal(revenue.status, 200);
  assert.equal(revenue.body.data.gross, 1000);
  assert.equal(revenue.body.data.refunded, 300);
  assert.equal(revenue.body.data.net, 600);
  assert.equal(revenue.body.data.payoutDue, 500);

  const byOrganizer = await get("/revenue/organizers?range=30d");
  assert.equal(byOrganizer.status, 200);
  assert.equal(byOrganizer.body.data[0].balance, 500);
});

test("scans, settings and audit are readable", async () => {
  const scans = await get("/scans");
  assert.equal(scans.status, 200);
  assert.equal(scans.body.data.length, 1);
  assert.equal(scans.body.data[0].orderNo, "ORD-PAID");

  const settings = await get("/settings");
  assert.equal(settings.status, 200);
  assert.equal(settings.body.data.commissionRate, 0.1);

  const audit = await get("/audit");
  assert.equal(audit.status, 200);
  assert.equal(audit.body.meta.total, 1);

  const activity = await get("/activity");
  assert.equal(activity.status, 200);
  assert.equal(activity.body.data.length, 1);
});
