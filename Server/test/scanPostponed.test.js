import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const { scanTicket } = await import("../controllers/ticket.controller.js");
const { default: redisClient } = await import("../config/redis.js");
const { GenericEvent } = await import("../models/events.model.js");
const { TicketModel } = await import("../models/ticket.model.js");
const { UserTicketModel } = await import("../models/userTicket.model.js");

let mongo;
let seq = 0;

before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  redisClient.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([GenericEvent, TicketModel, UserTicketModel].map((m) => m.deleteMany({})));
});

const DAY = 24 * 60 * 60 * 1000;

// A ticket for an event that was postponed: its ORIGINAL date is already in
// the past, the event now happens (or will be announced) later.
const postponedTicket = async (status = "paid", dateTbd = false) => {
  const original = new Date(Date.now() - 3 * DAY);
  const event = await GenericEvent.create({
    adminId: new mongoose.Types.ObjectId(),
    name: "Gospel Praise Concert",
    status: "published",
    links: { venues: { name: "Hall" } },
    dates: {
      start: { dateTime: dateTbd ? original : new Date(Date.now() + 5 * DAY) },
      status: { code: "postponed" },
      postponedFrom: { dateTime: original },
      dateTbd,
    },
  });
  const tier = await TicketModel.create({
    eventId: event._id,
    name: "Regular",
    price: 300,
    totalQuantity: 10,
    availableQuantity: 8,
  });
  return UserTicketModel.create({
    userId: new mongoose.Types.ObjectId(),
    ticketId: tier._id,
    orderNo: `ORD-${++seq}`,
    isVerified: status === "paid",
    quantity: 2,
    totalAmount: 600,
    status,
  });
};

// scanTicket is wrapped by catchAsync, which does not hand back a promise, so
// wait until the controller actually answers (or passes an error on).
const scan = (order) =>
  new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        resolve(this);
        return this;
      },
    };
    scanTicket(
      {
        body: { userTicketId: order._id.toString(), token: order.orderNo },
        user: { id: new mongoose.Types.ObjectId().toString(), role: "admin" },
      },
      res,
      reject,
    );
  });

test("a paid ticket checks in for a postponed event whose original date has passed", async () => {
  const res = await scan(await postponedTicket());
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Checked in");
});

test("it also checks in while the new date is still to be announced", async () => {
  const res = await scan(await postponedTicket("paid", true));
  assert.equal(res.statusCode, 200);
});

test("scanning the same ticket twice is refused", async () => {
  const order = await postponedTicket();
  await scan(order);
  const second = await scan(order);
  assert.equal(second.statusCode, 409);
});

test("a ticket that was never paid is still refused", async () => {
  const res = await scan(await postponedTicket("pending"));
  assert.equal(res.statusCode, 403);
});
