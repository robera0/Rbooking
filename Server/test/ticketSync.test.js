import { test, before, after, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { syncEventTickets, TicketSyncError } from "../service/ticketSync.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});

let eventId;
beforeEach(async () => {
  mock.restoreAll();
  await TicketModel.deleteMany({});
  await UserTicketModel.deleteMany({});
  eventId = new mongoose.Types.ObjectId().toString();
});

const tier = (name, price, capacity, extra = {}) => ({ name, price, capacity, ...extra });
const tickets = () => TicketModel.find({ eventId }).sort({ name: 1 }).lean();
const find = (name) => TicketModel.findOne({ eventId, name }).lean();

// Seeds an existing tier with some tickets already sold.
async function seed(name, total, sold, extra = {}) {
  return TicketModel.create({
    eventId,
    name,
    price: 100,
    totalQuantity: total,
    availableQuantity: total - sold,
    isActive: true,
    ...extra,
  });
}

const rejectsWith = (promise, code) =>
  assert.rejects(promise, (e) => e instanceof TicketSyncError && e.code === code && e.status === 400);

// ---- creating tiers ------------------------------------------------------

test("creates a new tier that is active with all seats available", async () => {
  await syncEventTickets(eventId, [tier("Regular", 500, 100)]);
  const t = await find("Regular");
  assert.equal(t.price, 500);
  assert.equal(t.totalQuantity, 100);
  assert.equal(t.availableQuantity, 100);
  assert.equal(t.isActive, true);
});

test("a tier added next to existing ones stays active", async () => {
  const existing = await seed("Regular", 100, 10);
  await syncEventTickets(eventId, [
    tier("Regular", 100, 100, { ticketId: existing._id.toString() }),
    tier("VIP", 900, 20),
  ]);
  assert.equal((await find("VIP")).isActive, true);
  assert.equal((await find("Regular")).isActive, true);
});

// ---- removing tiers ------------------------------------------------------

test("a tier removed from the form is deactivated, kept ones are not", async () => {
  const keep = await seed("Regular", 100, 0);
  await seed("VIP", 50, 5);
  const result = await syncEventTickets(eventId, [
    tier("Regular", 100, 100, { ticketId: keep._id.toString() }),
  ]);
  assert.equal((await find("Regular")).isActive, true);
  assert.equal((await find("VIP")).isActive, false);
  assert.equal(result.deactivated, 1);
});

test("a tier the admin switched off stays off", async () => {
  const t = await seed("Regular", 100, 0);
  await syncEventTickets(eventId, [tier("Regular", 100, 100, { ticketId: t._id.toString(), isActive: false })]);
  assert.equal((await find("Regular")).isActive, false);
});

test("deactivation is skipped when asked (adding tickets must not remove others)", async () => {
  await seed("Regular", 100, 0);
  await syncEventTickets(eventId, [tier("VIP", 900, 20)], { deactivateMissing: false });
  assert.equal((await find("Regular")).isActive, true);
});

// ---- capacity and availability --------------------------------------------

test("raising capacity adds the difference to availability (100 -> 150, 60 sold)", async () => {
  const t = await seed("Regular", 100, 60);
  await syncEventTickets(eventId, [tier("Regular", 100, 150, { ticketId: t._id.toString() })]);
  const after = await find("Regular");
  assert.equal(after.totalQuantity, 150);
  assert.equal(after.availableQuantity, 90);
});

test("lowering capacity removes the difference from availability (100 -> 80, 60 sold)", async () => {
  const t = await seed("Regular", 100, 60);
  await syncEventTickets(eventId, [tier("Regular", 100, 80, { ticketId: t._id.toString() })]);
  const after = await find("Regular");
  assert.equal(after.totalQuantity, 80);
  assert.equal(after.availableQuantity, 20);
});

test("unchanged capacity leaves availability alone", async () => {
  const t = await seed("Regular", 100, 60);
  await syncEventTickets(eventId, [tier("Regular", 250, 100, { ticketId: t._id.toString() })]);
  const after = await find("Regular");
  assert.equal(after.availableQuantity, 40);
  assert.equal(after.price, 250);
});

test("capacity may drop to exactly the sold count", async () => {
  const t = await seed("Regular", 100, 60);
  await syncEventTickets(eventId, [tier("Regular", 100, 60, { ticketId: t._id.toString() })]);
  assert.equal((await find("Regular")).availableQuantity, 0);
});

test("capacity below the sold count is rejected and nothing is changed", async () => {
  const a = await seed("Regular", 100, 60);
  const b = await seed("VIP", 50, 0);
  await rejectsWith(
    syncEventTickets(eventId, [
      tier("VIP", 999, 70, { ticketId: b._id.toString() }),
      tier("Regular", 100, 50, { ticketId: a._id.toString() }),
    ]),
    "CAPACITY_BELOW_SOLD",
  );
  assert.equal((await find("VIP")).totalQuantity, 50, "VIP must be untouched");
  assert.equal((await find("VIP")).price, 100, "VIP must be untouched");
  assert.equal((await find("Regular")).availableQuantity, 40);
});

// ---- renames, ids and duplicates ------------------------------------------

test("renaming by ticketId updates the same document and keeps its sold count", async () => {
  const t = await seed("Regular", 100, 30);
  await syncEventTickets(eventId, [tier("General", 100, 100, { ticketId: t._id.toString() })]);
  const all = await tickets();
  assert.equal(all.length, 1);
  assert.equal(all[0]._id.toString(), t._id.toString());
  assert.equal(all[0].name, "General");
  assert.equal(all[0].availableQuantity, 70);
});

test("a tier without an id matches an existing one by name instead of duplicating", async () => {
  const t = await seed("Regular", 100, 30);
  await syncEventTickets(eventId, [tier("  regular ", 120, 100)]);
  const all = await tickets();
  assert.equal(all.length, 1);
  assert.equal(all[0]._id.toString(), t._id.toString());
  assert.equal(all[0].price, 120);
  assert.equal(all[0].availableQuantity, 70);
});

test("saving the same id-less tiers repeatedly (autosave) never creates duplicates", async () => {
  for (let i = 0; i < 5; i++) {
    await syncEventTickets(eventId, [tier("Regular", 500, 100), tier("VIP", 900, 20)]);
  }
  const all = await tickets();
  assert.deepEqual(all.map((t) => [t.name, t.isActive]), [["Regular", true], ["VIP", true]]);
});

test("a name match brings a switched-off tier back when submitted active", async () => {
  await seed("Regular", 100, 0, { isActive: false });
  await syncEventTickets(eventId, [tier("Regular", 100, 100)]);
  const all = await tickets();
  assert.equal(all.length, 1);
  assert.equal(all[0].isActive, true);
});

test("two submitted tiers with the same name are rejected", async () => {
  await rejectsWith(
    syncEventTickets(eventId, [tier("Regular", 100, 10), tier(" REGULAR", 200, 20)]),
    "DUPLICATE_TIER_NAME",
  );
  assert.equal((await tickets()).length, 0);
});

test("renaming a tier onto another tier's name is rejected", async () => {
  const a = await seed("Regular", 100, 0);
  const b = await seed("VIP", 100, 0);
  await rejectsWith(
    syncEventTickets(eventId, [
      tier("Regular", 100, 100, { ticketId: a._id.toString() }),
      tier("Regular", 100, 100, { ticketId: b._id.toString() }),
    ]),
    "DUPLICATE_TIER_NAME",
  );
});

test("a ticketId from another event is rejected, not silently dropped", async () => {
  const otherEvent = new mongoose.Types.ObjectId();
  const foreign = await TicketModel.create({
    eventId: otherEvent, name: "Regular", price: 1, totalQuantity: 5, availableQuantity: 5,
  });
  await rejectsWith(
    syncEventTickets(eventId, [tier("Regular", 100, 10, { ticketId: foreign._id.toString() })]),
    "TICKET_NOT_IN_EVENT",
  );
  const untouched = await TicketModel.findById(foreign._id).lean();
  assert.equal(untouched.price, 1);
});

test("one event's sync never touches another event's tickets", async () => {
  const otherEvent = new mongoose.Types.ObjectId();
  await TicketModel.create({
    eventId: otherEvent, name: "Regular", price: 1, totalQuantity: 5, availableQuantity: 5,
  });
  await syncEventTickets(eventId, [tier("VIP", 900, 20)]);
  const other = await TicketModel.findOne({ eventId: otherEvent }).lean();
  assert.equal(other.isActive, true);
  assert.equal(other.price, 1);
});

// ---- validation --------------------------------------------------------------

test("invalid tiers are rejected and nothing is written", async () => {
  const bad = [
    tier("", 100, 10),
    tier("   ", 100, 10),
    tier("A", -1, 10),
    tier("A", "abc", 10),
    tier("A", 100, 1.5),
    tier("A", 100, -3),
    tier("A", 100, ""),
    tier("A", 100, undefined),
    tier("A", 100, "ten"),
    { name: "A", price: 100, capacity: 10, ticketId: "not-an-id" },
  ];
  for (const t of bad) {
    await rejectsWith(syncEventTickets(eventId, [tier("Good", 100, 10), t]), "INVALID_TICKET");
  }
  assert.equal((await tickets()).length, 0);
});

test("numeric strings from a form are accepted", async () => {
  await syncEventTickets(eventId, [tier("Regular", "500", "100")]);
  const t = await find("Regular");
  assert.equal(t.price, 500);
  assert.equal(t.totalQuantity, 100);
});

test("an empty list deactivates every tier that has sales", async () => {
  await seed("Regular", 100, 3);
  await syncEventTickets(eventId, []);
  assert.equal((await find("Regular")).isActive, false);
});

test("does not mutate the input", async () => {
  const input = [tier("Regular", "500", "100")];
  const snapshot = JSON.parse(JSON.stringify(input));
  await syncEventTickets(eventId, input);
  assert.deepEqual(input, snapshot);
});

// ---- concurrency -----------------------------------------------------------------

test("a purchase racing a capacity change keeps availability consistent", async () => {
  const t = await seed("Regular", 100, 0);
  const id = t._id.toString();

  // 20 buyers take 1 seat each while the admin raises capacity to 150.
  const purchases = Array.from({ length: 20 }, () =>
    TicketModel.updateOne({ _id: id, availableQuantity: { $gte: 1 } }, { $inc: { availableQuantity: -1 } }),
  );
  await Promise.all([
    ...purchases,
    syncEventTickets(eventId, [tier("Regular", 100, 150, { ticketId: id })]),
  ]);

  const after = await find("Regular");
  assert.equal(after.totalQuantity, 150);
  // 20 sold, so available must be exactly total - sold, however the writes interleaved.
  assert.equal(after.availableQuantity, 130);
});

// ---- review/QA findings ------------------------------------------------------

test("capacity below sold is still rejected when a purchase lands after the read", async () => {
  const t = await seed("Regular", 100, 0);
  // The sync reads a snapshot saying nothing is sold...
  const stale = [{ ...t.toObject(), availableQuantity: 100 }];
  mock.method(TicketModel, "find", () => ({ lean: async () => stale }));
  // ...but by write time 60 seats have actually been bought.
  await TicketModel.collection.updateOne({ _id: t._id }, { $set: { availableQuantity: 40 } });

  await rejectsWith(
    syncEventTickets(eventId, [tier("Regular", 100, 50, { ticketId: t._id.toString() })]),
    "CAPACITY_BELOW_SOLD",
  );
  mock.restoreAll();
  const after = await find("Regular");
  assert.equal(after.totalQuantity, 100, "the ticket must be left as it was");
  assert.equal(after.availableQuantity, 40);
});

test("tickets stored without availableQuantity are treated as nothing sold", async () => {
  const _id = new mongoose.Types.ObjectId();
  await TicketModel.collection.insertOne({
    _id, eventId: new mongoose.Types.ObjectId(eventId), name: "Old", price: 10, totalQuantity: 100, isActive: true,
  });
  await syncEventTickets(eventId, [tier("Old", 10, 150, { ticketId: _id.toString() })]);
  const t = await find("Old");
  assert.equal(t.totalQuantity, 150);
  assert.equal(t.availableQuantity, 150);
});

test("capacity and price have sane upper limits", async () => {
  for (const bad of [1e308, 2 ** 53 + 1, 1_000_001, Infinity]) {
    await rejectsWith(syncEventTickets(eventId, [tier("A", 10, bad)]), "INVALID_TICKET");
  }
  for (const bad of [1e308, 10_000_001, Infinity]) {
    await rejectsWith(syncEventTickets(eventId, [tier("A", bad, 10)]), "INVALID_TICKET");
  }
  assert.equal((await tickets()).length, 0);
});

test("only plain numbers are accepted for price and capacity", async () => {
  for (const bad of ["0x10", "1e3", true, null, [5], { a: 1 }, " ", "1,000", "-0.5"]) {
    await rejectsWith(syncEventTickets(eventId, [tier("A", bad, 10)]), "INVALID_TICKET");
    await rejectsWith(syncEventTickets(eventId, [tier("A", 10, bad)]), "INVALID_TICKET");
  }
  await syncEventTickets(eventId, [tier("Ok", "12.5", "40")]);
  assert.equal((await find("Ok")).price, 12.5);
});

test("isActive accepts booleans and the strings true/false, nothing else", async () => {
  await syncEventTickets(eventId, [tier("Off", 1, 1, { isActive: "false" }), tier("On", 1, 1, { isActive: "true" })]);
  assert.equal((await find("Off")).isActive, false);
  assert.equal((await find("On")).isActive, true);
  await rejectsWith(syncEventTickets(eventId, [tier("X", 1, 1, { isActive: "maybe" })]), "INVALID_TICKET");
  await rejectsWith(syncEventTickets(eventId, [tier("X", 1, 1, { isActive: 0 })]), "INVALID_TICKET");
});

test("matching by name keeps the stored spelling", async () => {
  await seed("VIP", 100, 0);
  await syncEventTickets(eventId, [tier(" vip ", 100, 100)]);
  assert.equal((await tickets())[0].name, "VIP");
});

// ---- stray tickets left by autosave ---------------------------------------------

test("autosave while typing a tier name leaves one ticket, not one per keystroke", async () => {
  for (const name of ["V", "VI", "VIP"]) {
    await syncEventTickets(eventId, [tier(name, 100, 10)]);
  }
  const all = await tickets();
  assert.deepEqual(all.map((t) => [t.name, t.isActive]), [["VIP", true]]);
});

test("a removed tier with no sales and no orders is deleted", async () => {
  await seed("Gone", 100, 0);
  const keep = await seed("Keep", 100, 0);
  const result = await syncEventTickets(eventId, [tier("Keep", 100, 100, { ticketId: keep._id.toString() })]);
  assert.equal(await find("Gone"), null);
  assert.equal(result.deleted, 1);
  assert.equal(result.deactivated, 0);
});

test("a removed tier with sales is kept, switched off", async () => {
  await seed("Sold", 100, 4);
  await syncEventTickets(eventId, []);
  assert.equal((await find("Sold")).isActive, false);
});

test("a removed tier that has an order on record is never deleted, even if stock was restored", async () => {
  const t = await seed("Had", 100, 0);
  await UserTicketModel.collection.insertOne({
    ticketId: t._id, userId: new mongoose.Types.ObjectId(), orderNo: "ORD-X", quantity: 2, status: "expired",
  });
  await syncEventTickets(eventId, []);
  const after = await find("Had");
  assert.ok(after, "the ticket must still exist for the order's history");
  assert.equal(after.isActive, false);
});
