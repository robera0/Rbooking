import { test, before, after, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { GenericEvent } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { backfillPaidTo, isLocalMongoUrl } from "../service/backfillPaidTo.service.js";

const NUMBER = { provider: "Telebirr", accountNumber: "0911223344", receiverName: "Selam Tadesse" };
const OTHER = { provider: "Telebirr", accountNumber: "0922556677", receiverName: "Dawit Bekele" };

describe("isLocalMongoUrl", () => {
  test("accepts local addresses, with or without credentials", () => {
    assert.equal(isLocalMongoUrl("mongodb://localhost:27017/TimeBooking"), true);
    assert.equal(isLocalMongoUrl("mongodb://127.0.0.1:27017/x"), true);
    assert.equal(isLocalMongoUrl("mongodb://user:pw@localhost:27017/x"), true);
  });

  test("refuses remote and cluster addresses", () => {
    assert.equal(isLocalMongoUrl("mongodb+srv://u:p@cluster0.example.mongodb.net/db"), false);
    assert.equal(isLocalMongoUrl("mongodb://db.example.com:27017/x"), false);
    assert.equal(isLocalMongoUrl("mongodb://localhost.evil.com:27017/x"), false);
    assert.equal(isLocalMongoUrl(""), false);
    assert.equal(isLocalMongoUrl(undefined), false);
  });
});

describe("backfillPaidTo (database)", () => {
  let mongo;
  before(async () => {
    mongo = await startTestMongo();
  });
  after(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    await Promise.all(
      [AdminProfile, GenericEvent, TicketModel, UserTicketModel].map((m) => m.deleteMany({})),
    );
  });

  const oid = () => new mongoose.Types.ObjectId();
  let seq = 0;
  const makeOrganizer = async (paymentMethods) => {
    const profile = await AdminProfile.create({
      userId: oid(),
      firstName: "O",
      lastName: "W",
      phone: "0911",
      email: `o${++seq}@example.com`,
      organizationName: "Org",
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
      totalQuantity: 100,
      availableQuantity: 100,
    });
    return { profile, tier };
  };
  const order = (tier, status, quantity, extra = {}) =>
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
  const reload = (o) => UserTicketModel.findById(o._id).lean();

  test("fills paid orders for an organizer with exactly one Telebirr number", async () => {
    const { tier } = await makeOrganizer([NUMBER]);
    const paid = await order(tier, "paid", 2);

    const result = await backfillPaidTo({ apply: true });
    assert.equal(result.ordersUpdated, 1);
    assert.deepEqual((await reload(paid)).paidTo, NUMBER);
  });

  test("leaves organizers with several numbers alone and says so", async () => {
    const { tier } = await makeOrganizer([NUMBER, OTHER]);
    const paid = await order(tier, "paid", 2);

    const result = await backfillPaidTo({ apply: true });
    assert.equal(result.ordersUpdated, 0);
    assert.equal(result.organizersSkippedMultiple, 1);
    assert.equal((await reload(paid)).paidTo, undefined);
  });

  test("a number with no holder name is not enough to credit old payments to", async () => {
    const { tier } = await makeOrganizer([{ provider: "Telebirr", accountNumber: "0911223344", receiverName: "" }]);
    const paid = await order(tier, "paid", 2);

    const result = await backfillPaidTo({ apply: true });
    assert.equal(result.ordersUpdated, 0);
    assert.equal((await reload(paid)).paidTo, undefined);
  });

  test("the report says which number each organizer would be credited, for a hand check", async () => {
    const { tier } = await makeOrganizer([NUMBER]);
    await order(tier, "paid", 2);

    const result = await backfillPaidTo({ apply: false });
    assert.deepEqual(result.organizers, [
      { accountNumber: NUMBER.accountNumber, receiverName: NUMBER.receiverName, ordersMatched: 1 },
    ]);
  });

  test("only touches paid orders that had money paid", async () => {
    const { tier } = await makeOrganizer([NUMBER]);
    const pending = await order(tier, "pending", 1);
    const refunded = await order(tier, "refunded", 1);
    const free = await UserTicketModel.create({
      userId: oid(),
      ticketId: tier._id,
      orderNo: `ORD-${++seq}`,
      isVerified: true,
      quantity: 2,
      totalAmount: 0,
      status: "paid",
    });

    const result = await backfillPaidTo({ apply: true });
    assert.equal(result.ordersUpdated, 0);
    for (const o of [pending, refunded, free]) assert.equal((await reload(o)).paidTo, undefined);
  });

  test("never overwrites a number that was already recorded", async () => {
    const { tier } = await makeOrganizer([NUMBER]);
    const recorded = await order(tier, "paid", 1, { paidTo: OTHER });
    const shared = await order(tier, "paid", 1, {
      paidTo: { provider: "Telebirr", accountNumber: null, receiverName: "Selam Tadesse" },
    });

    await backfillPaidTo({ apply: true });
    assert.deepEqual((await reload(recorded)).paidTo, OTHER);
    assert.equal((await reload(shared)).paidTo.accountNumber, null);
  });

  test("a second run changes nothing", async () => {
    const { tier } = await makeOrganizer([NUMBER]);
    await order(tier, "paid", 2);

    await backfillPaidTo({ apply: true });
    const again = await backfillPaidTo({ apply: true });
    assert.equal(again.ordersUpdated, 0);
  });

  test("a dry run counts what it would change and changes nothing", async () => {
    const { tier } = await makeOrganizer([NUMBER]);
    const paid = await order(tier, "paid", 2);

    const result = await backfillPaidTo({ apply: false });
    assert.equal(result.ordersMatched, 1);
    assert.equal(result.ordersUpdated, 0);
    assert.equal((await reload(paid)).paidTo, undefined);
  });

  test("one organizer's number is never written onto another's orders", async () => {
    const a = await makeOrganizer([NUMBER]);
    const b = await makeOrganizer([OTHER]);
    const orderA = await order(a.tier, "paid", 1);
    const orderB = await order(b.tier, "paid", 1);

    await backfillPaidTo({ apply: true });
    assert.equal((await reload(orderA)).paidTo.accountNumber, NUMBER.accountNumber);
    assert.equal((await reload(orderB)).paidTo.accountNumber, OTHER.accountNumber);
  });
});
