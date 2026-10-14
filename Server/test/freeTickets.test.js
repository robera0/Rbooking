import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";
import {
  MAX_FREE_PER_EVENT,
  freeTicketsHeld,
  remainingFreeAllowance,
} from "../service/freeTickets.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});

const oid = () => new mongoose.Types.ObjectId();
let n = 0;

beforeEach(async () => {
  await Promise.all([
    UserTicketModel.collection.deleteMany({}),
    TicketModel.collection.deleteMany({}),
  ]);
});

async function tier(eventId, price = 0) {
  const { insertedId } = await TicketModel.collection.insertOne({
    eventId,
    name: "T",
    price,
    availableQuantity: 10,
  });
  return insertedId;
}

async function order(userId, ticketId, { quantity = 1, status = "paid", totalAmount = 0 } = {}) {
  await UserTicketModel.collection.insertOne({
    userId,
    ticketId,
    quantity,
    status,
    totalAmount,
    orderNo: `ORD-${++n}`,
  });
}

test("limit is 4", () => assert.equal(MAX_FREE_PER_EVENT, 4));

test("counts free paid/pending orders across all tiers of the event", async () => {
  const event = oid();
  const user = oid();
  const a = await tier(event);
  const b = await tier(event);
  await order(user, a, { quantity: 1 });
  await order(user, b, { quantity: 2, status: "pending" });
  assert.equal(await freeTicketsHeld(user, event), 3);
  assert.equal(await remainingFreeAllowance(user, event), 1);
});

test("ignores cancelled, refunded, expired, paid-price orders, other users and other events", async () => {
  const event = oid();
  const user = oid();
  const a = await tier(event);
  const priced = await tier(event, 100);
  const otherEventTier = await tier(oid());
  await order(user, a, { status: "cancelled" });
  await order(user, a, { status: "refunded" });
  await order(user, a, { status: "expired" });
  await order(user, priced, { quantity: 3, totalAmount: 300 });
  await order(user, otherEventTier, { quantity: 3 });
  await order(oid(), a, { quantity: 3 });
  assert.equal(await freeTicketsHeld(user, event), 0);
  assert.equal(await remainingFreeAllowance(user, event), 4);
});

test("remaining allowance never goes below zero", async () => {
  const event = oid();
  const user = oid();
  const a = await tier(event);
  await order(user, a, { quantity: 6 });
  assert.equal(await remainingFreeAllowance(user, event), 0);
});
