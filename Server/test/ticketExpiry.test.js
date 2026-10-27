import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { TicketModel } from "../models/ticket.model.js";
import {
  expirePendingTickets,
  hideExpiredMatch,
} from "../utils/ticketExpiry.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});

const oid = () => new mongoose.Types.ObjectId();
const MIN = 60 * 1000;

beforeEach(async () => {
  await Promise.all([
    UserTicketModel.collection.deleteMany({}),
    TicketModel.collection.deleteMany({}),
  ]);
});

async function makeTier(availableQuantity = 5) {
  const { insertedId } = await TicketModel.collection.insertOne({
    eventId: oid(),
    name: "GA",
    price: 100,
    availableQuantity,
  });
  return insertedId;
}

async function makeOrder(ticketId, { status = "pending", quantity = 2, expiresAt }) {
  const { insertedId } = await UserTicketModel.collection.insertOne({
    userId: oid(),
    ticketId,
    quantity,
    status,
    expiresAt,
    totalAmount: 200,
    orderNo: `ORD-${oid()}`,
  });
  return insertedId;
}

const stock = async (id) => (await TicketModel.collection.findOne({ _id: id })).availableQuantity;
const statusOf = async (id) => (await UserTicketModel.collection.findOne({ _id: id }))?.status;

test("lapsed pending order is expired and its seats returned", async () => {
  const tier = await makeTier(3);
  const order = await makeOrder(tier, { expiresAt: new Date(Date.now() - MIN) });
  const count = await expirePendingTickets();
  assert.equal(count, 1);
  assert.equal(await statusOf(order), "expired");
  assert.equal(await stock(tier), 5);
});

test("running twice does not return seats twice", async () => {
  const tier = await makeTier(3);
  await makeOrder(tier, { expiresAt: new Date(Date.now() - MIN) });
  await Promise.all([expirePendingTickets(), expirePendingTickets()]);
  await expirePendingTickets();
  assert.equal(await stock(tier), 5);
});

test("live pending and paid orders are untouched", async () => {
  const tier = await makeTier(3);
  const live = await makeOrder(tier, { expiresAt: new Date(Date.now() + 10 * MIN) });
  const paid = await makeOrder(tier, { status: "paid", expiresAt: new Date(Date.now() - MIN) });
  assert.equal(await expirePendingTickets(), 0);
  assert.equal(await statusOf(live), "pending");
  assert.equal(await statusOf(paid), "paid");
  assert.equal(await stock(tier), 3);
});

test("expired orders older than a day are deleted", async () => {
  const tier = await makeTier(3);
  const old = await makeOrder(tier, { status: "expired", expiresAt: new Date(Date.now() - 25 * 60 * MIN) });
  const recent = await makeOrder(tier, { status: "expired", expiresAt: new Date(Date.now() - 60 * MIN) });
  await expirePendingTickets();
  assert.equal(await statusOf(old), undefined);
  assert.equal(await statusOf(recent), "expired");
});

test("hideExpiredMatch drops expired and lapsed-pending, keeps live ones", async () => {
  const tier = await makeTier();
  const past = new Date(Date.now() - MIN);
  const future = new Date(Date.now() + 10 * MIN);
  const keep = [
    await makeOrder(tier, { status: "paid", expiresAt: past }),
    await makeOrder(tier, { status: "pending", expiresAt: future }),
  ];
  await makeOrder(tier, { status: "expired", expiresAt: past });
  await makeOrder(tier, { status: "pending", expiresAt: past });
  const rows = await UserTicketModel.aggregate([{ $match: hideExpiredMatch() }]);
  assert.deepEqual(rows.map((r) => String(r._id)).sort(), keep.map(String).sort());
});
