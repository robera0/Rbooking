import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";

process.env.API_KEY ||= "test-key";

const { default: oditClient } = await import("../service/oditClient.service.js");
const { default: redisClient } = await import("../config/redis.js");
const { verifyTicket } = await import("../controllers/ticket.controller.js");
const { AdminProfile } = await import("../models/adminProfile.model.js");
const { GenericEvent } = await import("../models/events.model.js");
const { TicketModel } = await import("../models/ticket.model.js");
const { UserTicketModel } = await import("../models/userTicket.model.js");

const RECEIPT_URL = "https://transactioninfo.ethiotelecom.et/receipt/DAB1C2D3E4";
let mongo;
let seq = 0;

// Answer receipt lookups from memory instead of calling the real service.
const answerReceiptsWith = (receipt) => {
  oditClient.defaults.adapter = async (config) => ({
    data: { ok: true, receipt },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
};

before(async () => {
  mongo = await startTestMongo();
});

after(async () => {
  redisClient.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all(
    [AdminProfile, GenericEvent, TicketModel, UserTicketModel].map((m) => m.deleteMany({})),
  );
});

const setUp = async (paymentMethods) => {
  const profile = await AdminProfile.create({
    userId: new mongoose.Types.ObjectId(),
    firstName: "Org",
    lastName: "Owner",
    phone: "0911000000",
    email: "org@example.com",
    organizationName: "Org Events",
    paymentMethods,
  });
  const event = await GenericEvent.create({
    adminId: profile._id,
    name: "Jazz",
    status: "published",
    links: { venues: { name: "Hall" } },
  });
  const tier = await TicketModel.create({
    eventId: event._id,
    name: "Regular",
    price: 300,
    totalQuantity: 10,
    availableQuantity: 8,
  });
  const buyerId = new mongoose.Types.ObjectId();
  const order = await UserTicketModel.create({
    userId: buyerId,
    ticketId: tier._id,
    orderNo: `ORD-${++seq}`,
    isVerified: false,
    quantity: 2,
    totalAmount: 600,
    status: "pending",
  });
  return { order, buyerId };
};

const verify = async ({ order, buyerId }, receiptName) => {
  answerReceiptsWith({
    transactionStatus: "Completed",
    creditedPartyName: receiptName,
    settledAmount: 600,
    receiptNo: `RCPT-${++seq}`,
  });
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await verifyTicket(
    {
      params: { userTicketId: order._id.toString() },
      body: { receiptUrl: RECEIPT_URL },
      user: { id: buyerId.toString() },
    },
    res,
  );
  return { res, saved: await UserTicketModel.findById(order._id).lean() };
};

const TWO_NUMBERS = [
  { provider: "Telebirr", accountNumber: "0911223344", receiverName: "Selam Tadesse" },
  { provider: "Telebirr", accountNumber: "0922556677", receiverName: "Dawit Bekele" },
];

test("a verified payment records which Telebirr number received it", async () => {
  const ctx = await setUp(TWO_NUMBERS);
  const { res, saved } = await verify(ctx, "Dawit");

  assert.equal(res.statusCode, 200);
  assert.equal(saved.status, "paid");
  assert.deepEqual(saved.paidTo, {
    provider: "Telebirr",
    accountNumber: "0922556677",
    receiverName: "Dawit Bekele",
  });
});

test("the other number is recorded when the receipt names it", async () => {
  const ctx = await setUp(TWO_NUMBERS);
  const { saved } = await verify(ctx, "Selam Tadesse");
  assert.equal(saved.paidTo.accountNumber, "0911223344");
});

test("when two numbers share a name the order is paid but the number is unknown", async () => {
  const ctx = await setUp([
    { provider: "Telebirr", accountNumber: "0911000001", receiverName: "Selam Tadesse" },
    { provider: "Telebirr", accountNumber: "0911000002", receiverName: "Selam Tadesse" },
  ]);
  const { res, saved } = await verify(ctx, "Selam Tadesse");

  assert.equal(res.statusCode, 200);
  assert.equal(saved.status, "paid");
  assert.equal(saved.paidTo.accountNumber, null);
  assert.equal(saved.paidTo.receiverName, "Selam Tadesse");
});
