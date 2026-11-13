import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { normalizeDatesUpdate } from "../utils/postponement.js";

process.env.API_KEY ||= "test-key";
const { updateEvent, addEvent } = await import("../controllers/events.controller.js");
const { default: redisClient } = await import("../config/redis.js");
const { GenericEvent } = await import("../models/events.model.js");
const { AdminProfile } = await import("../models/adminProfile.model.js");
await import("../models/comment.model.js");

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  redisClient.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([GenericEvent.deleteMany({}), AdminProfile.deleteMany({})]);
});

const at = (iso) => ({ dateTime: iso, localDate: iso.slice(0, 10), localTime: "18:00" });
const START = at("2026-12-18T15:00:00.000Z");
const END = at("2026-12-18T20:00:00.000Z");
const BAD_END = at("2026-12-18T10:00:00.000Z");

let owner;
const makeEvent = async (extra = {}) => {
  const userId = new mongoose.Types.ObjectId();
  const profile = await AdminProfile.create({ userId, firstName: "O", lastName: "W", phone: "0911", email: `o${Date.now()}${Math.random()}@example.com`, organizationName: "Org" });
  owner = userId.toString();
  return GenericEvent.create({
    adminId: profile._id,
    name: "Night",
    status: "published",
    links: { venues: { name: "Hall" } },
    dates: { start: START, timezone: "Africa/Addis_Ababa", status: { code: "onsale" } },
    ...extra,
  });
};

// Drive a controller and wait until it answers.
const run = (controller, req) =>
  new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      body: null,
      status(c) { this.statusCode = c; return this; },
      json(b) { this.body = b; resolve(this); return this; },
    };
    controller(req, res, reject);
  });

const update = (event, body) => run(updateEvent, { params: { eventId: event._id.toString() }, body, user: { id: owner, role: "admin" } });
const datesBody = (dates, extra = {}) => ({ dates: JSON.stringify(dates), ...extra });
const stored = (event) => GenericEvent.findById(event._id).lean();

// ---- saving never wipes an end that is already stored ---------------------

test("normalizeDatesUpdate keeps the stored end when the page sends none", () => {
  const out = normalizeDatesUpdate({ start: START, end: END, status: { code: "onsale" } }, { start: START, status: { code: "onsale" } });
  assert.equal(out.end.dateTime, END.dateTime);
});

test("a new end replaces the stored one", () => {
  const out = normalizeDatesUpdate({ start: START, end: END }, { start: START, end: at("2026-12-18T22:00:00.000Z") });
  assert.equal(out.end.dateTime, "2026-12-18T22:00:00.000Z");
});

test("postponed with the date still to be announced keeps start and end", () => {
  const out = normalizeDatesUpdate({ start: START, end: END, status: { code: "onsale" } }, { start: at("2027-01-01T10:00:00.000Z"), postponement: { postponed: true, dateTbd: true } });
  assert.equal(out.start.dateTime, START.dateTime);
  assert.equal(out.end.dateTime, END.dateTime);
});

// ---- publishing a draft needs an end --------------------------------------

test("publishing a draft without an end is refused", async () => {
  const ev = await makeEvent({ status: "draft" });
  const r = await update(ev, datesBody({ start: START }, { status: "published" }));
  assert.equal(r.statusCode, 400);
  assert.match(r.body.message, /end/i);
  assert.equal((await stored(ev)).status, "draft");
});

test("publishing a draft with an end works and stores it", async () => {
  const ev = await makeEvent({ status: "draft" });
  const r = await update(ev, datesBody({ start: START, end: END }, { status: "published" }));
  assert.equal(r.statusCode, 200);
  const s = await stored(ev);
  assert.equal(s.status, "published");
  assert.equal(new Date(s.dates.end.dateTime).toISOString(), END.dateTime);
});

test("saving a draft does not need an end", async () => {
  const ev = await makeEvent({ status: "draft" });
  const r = await update(ev, datesBody({ start: START }, { status: "draft" }));
  assert.equal(r.statusCode, 200);
});

// ---- older published events may stay without an end -----------------------

test("an older published event without an end can still be saved", async () => {
  const ev = await makeEvent();
  const r = await update(ev, datesBody({ start: START }));
  assert.equal(r.statusCode, 200);
  assert.equal(((await stored(ev)).dates.end || {}).dateTime, undefined);
});

test("an end added later to an older event must be after the start", async () => {
  const ev = await makeEvent();
  const bad = await update(ev, datesBody({ start: START, end: BAD_END }));
  assert.equal(bad.statusCode, 400);
  assert.match(bad.body.message, /after/i);
  const ok = await update(ev, datesBody({ start: START, end: END }));
  assert.equal(ok.statusCode, 200);
});

test("saving a published event with an end never wipes it when the page sends none", async () => {
  const ev = await makeEvent({ dates: { start: START, end: END, timezone: "Africa/Addis_Ababa", status: { code: "onsale" } } });
  const r = await update(ev, datesBody({ start: START }));
  assert.equal(r.statusCode, 200);
  assert.equal(new Date((await stored(ev)).dates.end.dateTime).toISOString(), END.dateTime);
});

test("moving the start past the stored end is refused with a clear message", async () => {
  const ev = await makeEvent({ dates: { start: START, end: END, timezone: "Africa/Addis_Ababa", status: { code: "onsale" } } });
  const r = await update(ev, datesBody({ start: at("2026-12-19T15:00:00.000Z") }));
  assert.equal(r.statusCode, 400);
  assert.match(r.body.message, /after/i);
});

// ---- creating an event ------------------------------------------------------

const create = async (body) => {
  const userId = new mongoose.Types.ObjectId();
  await AdminProfile.create({ userId, firstName: "O", lastName: "W", phone: "0911", email: `c${Date.now()}${Math.random()}@example.com`, organizationName: "Org" });
  return run(addEvent, { body: { type: "generic", name: "New night", links: JSON.stringify({ venues: { name: "Hall" } }), ...body }, files: [], user: { id: userId.toString(), role: "admin" } });
};

test("creating an event as published needs an end", async () => {
  const r = await create({ status: "published", dates: JSON.stringify({ start: START }) });
  assert.equal(r.statusCode, 400);
  assert.match(r.body.message, /end/i);
  assert.equal(await GenericEvent.countDocuments(), 0);
});

test("creating a draft, or a published event with an end, works", async () => {
  assert.equal((await create({ status: "draft", dates: JSON.stringify({ start: START }) })).statusCode, 200);
  assert.equal((await create({ status: "published", dates: JSON.stringify({ start: START, end: END }) })).statusCode, 200);
});

test("creating with an end before the start is refused", async () => {
  const r = await create({ status: "draft", dates: JSON.stringify({ start: START, end: BAD_END }) });
  assert.equal(r.statusCode, 400);
});
