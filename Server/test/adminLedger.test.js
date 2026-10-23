import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const { default: adminRouter } = await import("../routes/admin.routes.js");
const { default: redisClient } = await import("../config/redis.js");
const { AdminProfile } = await import("../models/adminProfile.model.js");
const { GenericEvent } = await import("../models/events.model.js");
const { TicketModel } = await import("../models/ticket.model.js");
const { UserTicketModel } = await import("../models/userTicket.model.js");

let mongo;
let server;
let base;
let seq = 0;

before(async () => {
  mongo = await startTestMongo();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth/admin", adminRouter);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/auth/admin`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  redisClient.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all(
    [AdminProfile, GenericEvent, TicketModel, UserTicketModel].map((m) => m.deleteMany({})),
  );
});

const oid = () => new mongoose.Types.ObjectId();

// An organizer (user + profile) who owns events, plus a cookie for them.
const makeOrganizer = async (label) => {
  const userId = oid();
  const profile = await AdminProfile.create({
    userId,
    firstName: label,
    lastName: "Org",
    phone: "0911000000",
    email: `${label}@example.com`,
    organizationName: `${label} Events`,
  });
  const token = jwt.sign({ id: userId.toString(), role: "admin" }, process.env.ACCESS_TOKEN_SECRET);
  return { profile, cookie: `accessToken=${token}` };
};

const makeEvent = (organizer, name) =>
  GenericEvent.create({
    adminId: organizer.profile._id,
    name,
    status: "published",
    links: { venues: { name: "Hall" } },
  });

const makeTier = (event, name = "Regular", price = 300) =>
  TicketModel.create({
    eventId: event._id,
    name,
    price,
    totalQuantity: 100,
    availableQuantity: 100,
  });

const makeOrder = (tier, status, quantity, extra = {}) =>
  UserTicketModel.create({
    userId: oid(),
    ticketId: tier._id,
    orderNo: `ORD-${++seq}`,
    isVerified: status === "paid",
    quantity,
    totalAmount: tier.price * quantity,
    status,
    ...extra,
  });

const ledger = async (organizer, query = "") => {
  const res = await fetch(`${base}/analytics/transactions${query}`, {
    headers: { cookie: organizer.cookie },
  });
  return { status: res.status, body: await res.json() };
};

test("lists every order on the organizer's events with a summary", async () => {
  const org = await makeOrganizer("a");
  const e1 = await makeEvent(org, "Jazz");
  const e2 = await makeEvent(org, "Run");
  const t1 = await makeTier(e1);
  const t2 = await makeTier(e2);
  await makeOrder(t1, "paid", 2);
  await makeOrder(t2, "paid", 3);
  await makeOrder(t2, "refunded", 1);

  const { status, body } = await ledger(org);
  assert.equal(status, 200);
  assert.equal(body.transactions.length, 3);
  assert.deepEqual(body.summary, {
    tickets: 5,
    grossCollected: 1800,
    refunded: 300,
    netRevenue: 1500,
  });
});

test("?eventId narrows the list and the summary to one event", async () => {
  const org = await makeOrganizer("a");
  const e1 = await makeEvent(org, "Jazz");
  const e2 = await makeEvent(org, "Run");
  const t1 = await makeTier(e1);
  const t2 = await makeTier(e2);
  await makeOrder(t1, "paid", 2);
  await makeOrder(t2, "paid", 3);

  const { body } = await ledger(org, `?eventId=${e1._id}`);
  assert.equal(body.transactions.length, 1);
  assert.equal(body.transactions[0].event.name, "Jazz");
  assert.equal(body.summary.tickets, 2);
  assert.equal(body.summary.netRevenue, 600);
});

test("another organizer's event id returns nothing, never their orders", async () => {
  const mine = await makeOrganizer("mine");
  const theirs = await makeOrganizer("theirs");
  const theirEvent = await makeEvent(theirs, "Secret");
  await makeOrder(await makeTier(theirEvent), "paid", 4);

  const { status, body } = await ledger(mine, `?eventId=${theirEvent._id}`);
  assert.equal(status, 200);
  assert.equal(body.transactions.length, 0);
  assert.equal(body.summary.tickets, 0);
});

test("an event id that is not valid is a 400", async () => {
  const org = await makeOrganizer("a");
  const { status } = await ledger(org, "?eventId=not-an-id");
  assert.equal(status, 400);
});

test("expired orders stay hidden and out of the summary", async () => {
  const org = await makeOrganizer("a");
  const t = await makeTier(await makeEvent(org, "Jazz"));
  await makeOrder(t, "expired", 5);
  await makeOrder(t, "paid", 1);

  const { body } = await ledger(org);
  assert.equal(body.transactions.length, 1);
  assert.equal(body.summary.tickets, 1);
});

const sales = async (organizer, query = "") => {
  const res = await fetch(`${base}/analytics/sales${query}`, {
    headers: organizer ? { cookie: organizer.cookie } : {},
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

test("sales: refuses a visitor and a normal user", async () => {
  assert.equal((await sales(null)).status, 401);
  const token = jwt.sign({ id: oid().toString(), role: "user" }, process.env.ACCESS_TOKEN_SECRET);
  const res = await fetch(`${base}/analytics/sales`, { headers: { cookie: `accessToken=${token}` } });
  assert.equal(res.status, 403);
});

test("sales: returns totals and a row per ticket type for one event", async () => {
  const org = await makeOrganizer("a");
  const event = await makeEvent(org, "Jazz");
  const tier = await makeTier(event, "Regular", 300);
  await makeOrder(tier, "paid", 4);

  const { status, body } = await sales(org, `?eventId=${event._id}`);
  assert.equal(status, 200);
  assert.equal(body.event.name, "Jazz");
  assert.equal(body.totals.tickets, 4);
  assert.equal(body.byTicketType.length, 1);
  assert.equal(body.byTicketType[0].revenue, 1200);
});

test("sales: an invalid event id is a 400", async () => {
  const org = await makeOrganizer("a");
  assert.equal((await sales(org, "?eventId=nope")).status, 400);
});

test("the ledger does not hand the organizer a buyer's private profile data", async () => {
  const org = await makeOrganizer("a");
  const tier = await makeTier(await makeEvent(org, "Jazz"));
  await makeOrder(tier, "paid", 1);

  const { body } = await ledger(org);
  const row = JSON.stringify(body.transactions[0]);
  for (const secret of ["googleId", "dateOfBirth", "nationality", "refreshTokens", "password"]) {
    assert.equal(row.includes(secret), false, `${secret} should not be in a ledger row`);
  }
  assert.equal(body.transactions[0].profile, undefined);
});

test("an event id sent as a list is a 400, not a server error", async () => {
  const org = await makeOrganizer("a");
  const event = await makeEvent(org, "Jazz");
  assert.equal((await ledger(org, `?eventId[]=${event._id}`)).status, 400);
  assert.equal((await sales(org, `?eventId[]=${event._id}`)).status, 400);
});

const order = async (organizer, id) => {
  const res = await fetch(`${base}/analytics/transactions/${id}`, {
    headers: organizer ? { cookie: organizer.cookie } : {},
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

test("one order: the organizer who owns it can read it", async () => {
  const org = await makeOrganizer("a");
  const tier = await makeTier(await makeEvent(org, "Jazz"));
  const paid = await makeOrder(tier, "paid", 2);
  assert.equal((await order(org, paid._id)).status, 200);
});

test("one order: another organizer cannot read it, and cannot tell it exists", async () => {
  const mine = await makeOrganizer("mine");
  const theirs = await makeOrganizer("theirs");
  const tier = await makeTier(await makeEvent(theirs, "Secret"));
  const paid = await makeOrder(tier, "paid", 2);
  assert.equal((await order(mine, paid._id)).status, 404);
});

test("one order: a normal user and a visitor are refused", async () => {
  const org = await makeOrganizer("a");
  const tier = await makeTier(await makeEvent(org, "Jazz"));
  const paid = await makeOrder(tier, "paid", 2);
  assert.equal((await order(null, paid._id)).status, 401);
  const token = jwt.sign({ id: oid().toString(), role: "user" }, process.env.ACCESS_TOKEN_SECRET);
  const res = await fetch(`${base}/analytics/transactions/${paid._id}`, { headers: { cookie: `accessToken=${token}` } });
  assert.equal(res.status, 403);
});

const eventList = async (cookie) => {
  const res = await fetch(`${base}/events`, { headers: { cookie } });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

test("the events list holds only the caller's events, each with its sales", async () => {
  const mine = await makeOrganizer("mine");
  const theirs = await makeOrganizer("theirs");
  const myEvent = await makeEvent(mine, "Mine");
  await makeEvent(theirs, "Theirs");
  await makeOrder(await makeTier(myEvent), "paid", 3);

  const { status, body } = await eventList(mine.cookie);
  assert.equal(status, 200);
  assert.deepEqual(body.events.map((e) => e.name), ["Mine"]);
  assert.equal(body.events[0].sales.sold, 3);
});

test("a club owner can open the admin area and simply sees no events", async () => {
  const token = jwt.sign({ id: oid().toString(), role: "club_owner" }, process.env.ACCESS_TOKEN_SECRET);
  const { status, body } = await eventList(`accessToken=${token}`);
  assert.equal(status, 200);
  assert.deepEqual(body.events, []);
});
