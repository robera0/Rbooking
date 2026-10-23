import { test, before, after, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import {
  summarizeOrders,
  isTierSoldOut,
  eventSoldOut,
  salesByEvent,
  salesBreakdown,
  groupByTelebirr,
  withConfiguredNumbers,
} from "../service/salesStats.service.js";
import { GenericEvent } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";

const order = (status, quantity, totalAmount) => ({ status, quantity, totalAmount });

describe("summarizeOrders", () => {
  test("counts tickets, not orders", () => {
    const s = summarizeOrders([order("paid", 3, 900), order("paid", 1, 300)]);
    assert.equal(s.tickets, 4);
    assert.equal(s.netRevenue, 1200);
  });

  test("pending, expired and cancelled orders add nothing", () => {
    const s = summarizeOrders([
      order("pending", 2, 600),
      order("expired", 1, 300),
      order("cancelled", 5, 1500),
    ]);
    assert.deepEqual(s, { tickets: 0, grossCollected: 0, refunded: 0, netRevenue: 0 });
  });

  test("a refunded order leaves sold and net but shows in refunded and gross", () => {
    const s = summarizeOrders([order("paid", 2, 600), order("refunded", 1, 300)]);
    assert.equal(s.tickets, 2);
    assert.equal(s.netRevenue, 600);
    assert.equal(s.refunded, 300);
    assert.equal(s.grossCollected, 900);
  });

  test("an empty list is all zeros", () => {
    assert.deepEqual(summarizeOrders([]), {
      tickets: 0,
      grossCollected: 0,
      refunded: 0,
      netRevenue: 0,
    });
  });
});

describe("sold out rules", () => {
  test("a tier is sold out at zero seats left and below", () => {
    assert.equal(isTierSoldOut({ availableQuantity: 0 }), true);
    assert.equal(isTierSoldOut({ availableQuantity: -1 }), true);
    assert.equal(isTierSoldOut({ availableQuantity: 1 }), false);
  });

  test("an event is sold out only when every active tier is", () => {
    const r = eventSoldOut([
      { name: "Regular", availableQuantity: 0 },
      { name: "VIP", availableQuantity: 0 },
    ]);
    assert.deepEqual(r, { soldOut: true, soldOutTypes: [] });
  });

  test("when only some tiers are sold out, they are listed", () => {
    const r = eventSoldOut([
      { name: "Regular", availableQuantity: 5 },
      { name: "VIP", availableQuantity: 0 },
    ]);
    assert.deepEqual(r, { soldOut: false, soldOutTypes: ["VIP"] });
  });

  test("inactive tiers are ignored", () => {
    const r = eventSoldOut([
      { name: "Regular", availableQuantity: 0 },
      { name: "Old", availableQuantity: 50, isActive: false },
    ]);
    assert.equal(r.soldOut, true);
  });

  test("an event with no ticket types is not sold out", () => {
    assert.deepEqual(eventSoldOut([]), { soldOut: false, soldOutTypes: [] });
  });
});

describe("salesByEvent (database)", () => {
  let mongo;
  before(async () => {
    mongo = await startTestMongo();
  });
  after(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    await TicketModel.deleteMany({});
    await UserTicketModel.deleteMany({});
  });

  const oid = () => new mongoose.Types.ObjectId();
  let seq = 0;
  const tier = (eventId, name, price, total, available, extra = {}) =>
    TicketModel.create({
      eventId,
      name,
      price,
      totalQuantity: total,
      availableQuantity: available,
      ...extra,
    });
  const buy = (ticketId, status, quantity, totalAmount) =>
    UserTicketModel.create({
      userId: oid(),
      ticketId,
      orderNo: `ORD-${++seq}`,
      isVerified: status === "paid",
      quantity,
      totalAmount,
      status,
    });

  test("adds up paid tickets, capacity and net revenue per event", async () => {
    const e1 = oid();
    const regular = await tier(e1, "Regular", 300, 100, 90);
    const vip = await tier(e1, "VIP", 1000, 10, 0);
    await buy(regular._id, "paid", 3, 900);
    await buy(regular._id, "paid", 1, 300);
    await buy(vip._id, "paid", 10, 10000);
    await buy(regular._id, "pending", 6, 1800);

    const result = await salesByEvent([e1]);
    const s = result.get(e1.toString());
    assert.equal(s.sold, 14);
    assert.equal(s.capacity, 110);
    assert.equal(s.netRevenue, 11200);
    assert.equal(s.soldOut, false);
    assert.deepEqual(s.soldOutTypes, ["VIP"]);
  });

  test("a refunded order is gross but not net", async () => {
    const e1 = oid();
    const t = await tier(e1, "Regular", 300, 10, 5);
    await buy(t._id, "paid", 2, 600);
    await buy(t._id, "refunded", 1, 300);

    const s = (await salesByEvent([e1])).get(e1.toString());
    assert.equal(s.sold, 2);
    assert.equal(s.netRevenue, 600);
    assert.equal(s.refunded, 300);
    assert.equal(s.grossCollected, 900);
  });

  test("an event is sold out when every active tier has no seats left", async () => {
    const e1 = oid();
    await tier(e1, "Regular", 300, 5, 0);
    await tier(e1, "Old tier", 100, 50, 50, { isActive: false });

    const s = (await salesByEvent([e1])).get(e1.toString());
    assert.equal(s.soldOut, true);
    assert.equal(s.capacity, 5);
  });

  test("a turned-off ticket type that already sold still counts in capacity", async () => {
    const e1 = oid();
    const off = await tier(e1, "Old", 100, 10, 5, { isActive: false });
    const on = await tier(e1, "Regular", 100, 10, 8);
    await buy(off._id, "paid", 5, 500);
    await buy(on._id, "paid", 2, 200);

    const s = (await salesByEvent([e1])).get(e1.toString());
    assert.equal(s.sold, 7);
    assert.equal(s.capacity, 20);
  });

  test("a turned-off type nobody bought stays out of capacity", async () => {
    const e1 = oid();
    await tier(e1, "Old", 100, 10, 10, { isActive: false });
    await tier(e1, "Regular", 100, 10, 10);
    const s = (await salesByEvent([e1])).get(e1.toString());
    assert.equal(s.capacity, 10);
  });

  test("an event with no ticket types gets zeros", async () => {
    const e1 = oid();
    const s = (await salesByEvent([e1])).get(e1.toString());
    assert.deepEqual(s, {
      sold: 0,
      capacity: 0,
      soldOut: false,
      soldOutTypes: [],
      grossCollected: 0,
      refunded: 0,
      netRevenue: 0,
    });
  });

  test("another event's orders never leak in", async () => {
    const e1 = oid();
    const e2 = oid();
    const t1 = await tier(e1, "Regular", 300, 10, 10);
    const t2 = await tier(e2, "Regular", 300, 10, 10);
    await buy(t1._id, "paid", 2, 600);
    await buy(t2._id, "paid", 7, 2100);

    const result = await salesByEvent([e1, e2]);
    assert.equal(result.get(e1.toString()).sold, 2);
    assert.equal(result.get(e2.toString()).sold, 7);
  });
});

describe("salesBreakdown (database)", () => {
  let mongo;
  before(async () => {
    mongo = await startTestMongo();
  });
  after(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    await Promise.all([TicketModel, UserTicketModel, GenericEvent].map((m) => m.deleteMany({})));
  });

  const oid = () => new mongoose.Types.ObjectId();
  let seq = 1000;
  const makeEvent = (adminId, name) =>
    GenericEvent.create({
      adminId,
      name,
      status: "published",
      links: { venues: { name: "Hall" } },
    });
  const tier = (eventId, name, price, total, available, extra = {}) =>
    TicketModel.create({ eventId, name, price, totalQuantity: total, availableQuantity: available, ...extra });
  const buy = (ticketId, status, quantity, totalAmount) =>
    UserTicketModel.create({
      userId: oid(),
      ticketId,
      orderNo: `ORD-${++seq}`,
      isVerified: status === "paid",
      quantity,
      totalAmount,
      status,
    });

  test("gives sold, left and revenue for each ticket type", async () => {
    const admin = oid();
    const event = await makeEvent(admin, "Jazz");
    const regular = await tier(event._id, "Regular", 600, 150, 40);
    const vip = await tier(event._id, "VIP", 1500, 40, 10);
    await buy(regular._id, "paid", 110, 66000);
    await buy(vip._id, "paid", 30, 45000);
    await buy(vip._id, "pending", 5, 7500);

    const result = await salesBreakdown(admin, event._id.toString());
    assert.equal(result.event.name, "Jazz");
    const regularRow = result.byTicketType.find((r) => r.name === "Regular");
    assert.deepEqual(regularRow, {
      ticketId: regular._id.toString(),
      name: "Regular",
      price: 600,
      sold: 110,
      left: 40,
      capacity: 150,
      revenue: 66000,
      soldOut: false,
    });
    assert.equal(result.byTicketType.find((r) => r.name === "VIP").sold, 30);
  });

  test("totals agree with the rows and include refunds", async () => {
    const admin = oid();
    const event = await makeEvent(admin, "Jazz");
    const regular = await tier(event._id, "Regular", 600, 150, 40);
    await buy(regular._id, "paid", 10, 6000);
    await buy(regular._id, "refunded", 2, 1200);

    const { totals, byTicketType } = await salesBreakdown(admin, event._id.toString());
    assert.deepEqual(totals, { tickets: 10, grossCollected: 7200, refunded: 1200, netRevenue: 6000 });
    assert.equal(
      byTicketType.reduce((n, r) => n + r.revenue, 0),
      totals.netRevenue,
    );
  });

  test("without an event id it covers all of the organizer's events", async () => {
    const admin = oid();
    const other = oid();
    const e1 = await makeEvent(admin, "Jazz");
    const e2 = await makeEvent(admin, "Run");
    const foreign = await makeEvent(other, "Secret");
    await buy((await tier(e1._id, "Regular", 100, 10, 10))._id, "paid", 2, 200);
    await buy((await tier(e2._id, "Entry", 50, 10, 10))._id, "paid", 3, 150);
    await buy((await tier(foreign._id, "Regular", 100, 10, 10))._id, "paid", 9, 900);

    const { totals, event } = await salesBreakdown(admin);
    assert.equal(event, null);
    assert.equal(totals.tickets, 5);
    assert.equal(totals.netRevenue, 350);
  });

  test("an event that is not the organizer's returns nothing", async () => {
    const admin = oid();
    const foreign = await makeEvent(oid(), "Secret");
    await buy((await tier(foreign._id, "Regular", 100, 10, 10))._id, "paid", 4, 400);

    const result = await salesBreakdown(admin, foreign._id.toString());
    assert.equal(result.event, null);
    assert.deepEqual(result.byTicketType, []);
    assert.equal(result.totals.tickets, 0);
  });

  test("an inactive ticket type with no sales is left out", async () => {
    const admin = oid();
    const event = await makeEvent(admin, "Jazz");
    await tier(event._id, "Regular", 100, 10, 10);
    await tier(event._id, "Old", 100, 10, 10, { isActive: false });

    const { byTicketType } = await salesBreakdown(admin, event._id.toString());
    assert.deepEqual(byTicketType.map((r) => r.name), ["Regular"]);
  });
});

const A = { provider: "Telebirr", accountNumber: "0911223344", receiverName: "Selam Tadesse" };
const B = { provider: "Telebirr", accountNumber: "0922556677", receiverName: "Dawit Bekele" };
const paidRow = (quantity, totalAmount, paidTo, orders = 1) => ({ quantity, totalAmount, paidTo, orders });

describe("groupByTelebirr", () => {
  test("one row per number with tickets, orders and money", () => {
    const rows = groupByTelebirr([
      paidRow(3, 900, A),
      paidRow(2, 600, A),
      paidRow(5, 1500, B),
    ]);
    const a = rows.find((r) => r.accountNumber === A.accountNumber);
    assert.deepEqual(
      { kind: a.kind, tickets: a.tickets, orders: a.orders, amount: a.amount, name: a.receiverName },
      { kind: "number", tickets: 5, orders: 2, amount: 1500, name: "Selam Tadesse" },
    );
    const b = rows.find((r) => r.accountNumber === B.accountNumber);
    assert.deepEqual({ tickets: b.tickets, orders: b.orders, amount: b.amount }, { tickets: 5, orders: 1, amount: 1500 });
  });

  test("pre-grouped rows count the orders they stand for", () => {
    const [row] = groupByTelebirr([paidRow(20, 6000, A, 7)]);
    assert.equal(row.orders, 7);
  });

  test("free orders, unrecorded orders and shared-name orders each get their own row", () => {
    const rows = groupByTelebirr([
      paidRow(2, 0, undefined),
      paidRow(3, 900, undefined),
      paidRow(1, 300, { provider: "Telebirr", accountNumber: null, receiverName: "Selam Tadesse" }),
    ]);
    const byKind = Object.fromEntries(rows.map((r) => [r.kind, r]));
    assert.equal(byKind.free.tickets, 2);
    assert.equal(byKind.before_tracking.amount, 900);
    assert.equal(byKind.unassigned.receiverName, "Selam Tadesse");
    assert.equal(byKind.unassigned.accountNumber, null);
  });

  test("the rows always add up to the totals", () => {
    const input = [
      paidRow(3, 900, A),
      paidRow(5, 1500, B),
      paidRow(2, 0, undefined),
      paidRow(3, 900, undefined),
      paidRow(1, 300, { provider: "Telebirr", accountNumber: null, receiverName: "X" }),
    ];
    const rows = groupByTelebirr(input);
    assert.equal(rows.reduce((n, r) => n + r.tickets, 0), 14);
    assert.equal(rows.reduce((n, r) => n + r.amount, 0), 3600);
  });

  test("numbers come first, biggest first, then the special rows", () => {
    const rows = groupByTelebirr([
      paidRow(2, 0, undefined),
      paidRow(3, 900, undefined),
      paidRow(1, 300, A),
      paidRow(5, 1500, B),
    ]);
    assert.deepEqual(rows.map((r) => r.kind), ["number", "number", "before_tracking", "free"]);
    assert.equal(rows[0].accountNumber, B.accountNumber);
  });

  test("no orders gives no rows", () => {
    assert.deepEqual(groupByTelebirr([]), []);
  });
});

describe("withConfiguredNumbers", () => {
  test("adds a zero row for a configured number nobody paid yet", () => {
    const rows = withConfiguredNumbers(groupByTelebirr([paidRow(2, 600, A)]), [A, B]);
    const b = rows.find((r) => r.accountNumber === B.accountNumber);
    assert.deepEqual({ tickets: b.tickets, orders: b.orders, amount: b.amount }, { tickets: 0, orders: 0, amount: 0 });
  });

  test("leaves numbers that already have a row alone and ignores other providers", () => {
    const rows = withConfiguredNumbers(groupByTelebirr([paidRow(2, 600, A)]), [
      A,
      { provider: "CBE", accountNumber: "1000", receiverName: "Z" },
    ]);
    assert.equal(rows.length, 1);
  });
});

describe("salesBreakdown byTelebirr (database)", () => {
  let mongo;
  before(async () => {
    mongo = await startTestMongo();
  });
  after(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    await Promise.all(
      [TicketModel, UserTicketModel, GenericEvent, AdminProfile].map((m) => m.deleteMany({})),
    );
  });

  const oid = () => new mongoose.Types.ObjectId();
  let seq = 5000;
  const setup = async (paymentMethods) => {
    const profile = await AdminProfile.create({
      userId: oid(),
      firstName: "O",
      lastName: "W",
      phone: "0911",
      email: "o@example.com",
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
    return { profile, event, tier };
  };
  const buy = (tier, status, quantity, paidTo) =>
    UserTicketModel.create({
      userId: oid(),
      ticketId: tier._id,
      orderNo: `ORD-${++seq}`,
      isVerified: status === "paid",
      quantity,
      totalAmount: tier.price * quantity,
      status,
      ...(paidTo ? { paidTo } : {}),
    });

  test("splits paid orders by number and adds up to the totals", async () => {
    const { profile, event, tier } = await setup([A, B]);
    await buy(tier, "paid", 3, A);
    await buy(tier, "paid", 2, A);
    await buy(tier, "paid", 5, B);
    await buy(tier, "paid", 1);
    await buy(tier, "pending", 4, A);
    await buy(tier, "refunded", 2, B);

    const { byTelebirr, totals } = await salesBreakdown(profile._id, event._id.toString());
    const a = byTelebirr.find((r) => r.accountNumber === A.accountNumber);
    const b = byTelebirr.find((r) => r.accountNumber === B.accountNumber);
    assert.deepEqual({ tickets: a.tickets, orders: a.orders, amount: a.amount }, { tickets: 5, orders: 2, amount: 1500 });
    assert.deepEqual({ tickets: b.tickets, orders: b.orders, amount: b.amount }, { tickets: 5, orders: 1, amount: 1500 });
    assert.equal(byTelebirr.find((r) => r.kind === "before_tracking").tickets, 1);
    assert.equal(byTelebirr.reduce((n, r) => n + r.tickets, 0), totals.tickets);
    assert.equal(byTelebirr.reduce((n, r) => n + r.amount, 0), totals.netRevenue);
  });

  test("free orders and older unrecorded paid orders stay in separate rows", async () => {
    const { profile, event, tier } = await setup([A]);
    await buy(tier, "paid", 2); // paid before numbers were recorded
    await UserTicketModel.create({
      userId: oid(),
      ticketId: tier._id,
      orderNo: `ORD-${++seq}`,
      isVerified: true,
      quantity: 3,
      totalAmount: 0,
      status: "paid",
    });

    const { byTelebirr } = await salesBreakdown(profile._id, event._id.toString());
    assert.equal(byTelebirr.find((r) => r.kind === "before_tracking").tickets, 2);
    assert.equal(byTelebirr.find((r) => r.kind === "free").tickets, 3);
  });

  test("a configured number with no sales still shows with zeros", async () => {
    const { profile, event, tier } = await setup([A, B]);
    await buy(tier, "paid", 2, A);

    const { byTelebirr } = await salesBreakdown(profile._id, event._id.toString());
    const b = byTelebirr.find((r) => r.accountNumber === B.accountNumber);
    assert.equal(b.tickets, 0);
  });

  test("covers every event of the organizer when no event id is given", async () => {
    const { profile, event, tier } = await setup([A, B]);
    const second = await GenericEvent.create({
      adminId: profile._id,
      name: "Run",
      status: "published",
      links: { venues: { name: "Park" } },
    });
    const tier2 = await TicketModel.create({
      eventId: second._id,
      name: "Entry",
      price: 100,
      totalQuantity: 10,
      availableQuantity: 10,
    });
    await buy(tier, "paid", 2, A);
    await buy(tier2, "paid", 4, A);

    const { byTelebirr } = await salesBreakdown(profile._id);
    assert.equal(byTelebirr.find((r) => r.accountNumber === A.accountNumber).tickets, 6);
  });
});
