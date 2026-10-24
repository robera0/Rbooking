import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { scanAnyTicket, ScanError } from "../service/superAdminScan.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});

const scannerId = new mongoose.Types.ObjectId().toString();
const startsAt = new Date("2026-11-01T17:00:00Z");

beforeEach(async () => {
  await Promise.all(
    [Event, TicketModel, UserModel, ProfileModel, UserTicketModel].map((m) =>
      m.deleteMany({}),
    ),
  );
});

async function seed(ticketOverrides = {}) {
  const event = await Event.create({
    adminId: new mongoose.Types.ObjectId(),
    name: "Halloween Night",
    links: { venues: { name: "Velvet" } },
    dates: { start: { dateTime: startsAt }, timezone: "Africa/Addis_Ababa" },
  });
  const tier = await TicketModel.create({
    eventId: event._id,
    name: "VIP",
    price: 500,
    totalQuantity: 10,
    availableQuantity: 9,
  });
  const user = await UserModel.create({ email: "buyer@example.com", password: "x" });
  await ProfileModel.create({ userId: user._id, fullName: "Abebe Kebede" });
  const userTicket = await UserTicketModel.create({
    userId: user._id,
    ticketId: tier._id,
    orderNo: "ORD-ABC123",
    isVerified: true,
    quantity: 2,
    totalAmount: 1000,
    status: "paid",
    ...ticketOverrides,
  });
  return { event, tier, user, userTicket };
}

const rejectsWith = (promise, status) =>
  assert.rejects(promise, (e) => e instanceof ScanError && e.statusCode === status);

test("checks a paid ticket in and names the event, time and holder", async () => {
  await seed();
  const result = await scanAnyTicket("ORD-ABC123", scannerId);
  assert.equal(result.outcome, "checked_in");
  assert.equal(result.event.name, "Halloween Night");
  assert.equal(result.event.startsAt.toISOString(), startsAt.toISOString());
  assert.equal(result.event.timezone, "Africa/Addis_Ababa");
  assert.equal(result.holder.name, "Abebe Kebede");
  assert.equal(result.holder.email, "buyer@example.com");
  assert.equal(result.ticket.name, "VIP");
  assert.equal(result.ticket.quantity, 2);
  const stored = await UserTicketModel.findOne({ orderNo: "ORD-ABC123" });
  assert.equal(stored.checked.checkedIn, true);
  assert.ok(stored.checked.checkedInAt);
});

test("a second scan reports already scanned with holder, event and first scan time", async () => {
  await seed();
  const first = await scanAnyTicket("ORD-ABC123", scannerId);
  const second = await scanAnyTicket("ORD-ABC123", scannerId);
  assert.equal(second.outcome, "already_scanned");
  assert.equal(second.holder.name, "Abebe Kebede");
  assert.equal(second.event.name, "Halloween Night");
  assert.equal(second.scannedAt.toISOString(), first.scannedAt.toISOString());
});

test("falls back to the email when the buyer has no profile name", async () => {
  const { user } = await seed();
  await ProfileModel.deleteMany({ userId: user._id });
  const result = await scanAnyTicket("ORD-ABC123", scannerId);
  assert.equal(result.holder.name, "buyer@example.com");
});

test("unknown code is a 404", async () => {
  await seed();
  await rejectsWith(scanAnyTicket("ORD-NOPE", scannerId), 404);
});

test("an unpaid ticket is refused with 403 and not checked in", async () => {
  await seed({ status: "pending", isVerified: false });
  await rejectsWith(scanAnyTicket("ORD-ABC123", scannerId), 403);
  const stored = await UserTicketModel.findOne({ orderNo: "ORD-ABC123" });
  assert.equal(stored.checked.checkedIn, false);
});

test("a non-string code is a 400", async () => {
  await rejectsWith(scanAnyTicket({ $ne: "" }, scannerId), 400);
  await rejectsWith(scanAnyTicket("", scannerId), 400);
});
