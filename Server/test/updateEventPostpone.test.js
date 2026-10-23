import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";

const { updateEvent } = await import("../controllers/events.controller.js");
const { default: redisClient } = await import("../config/redis.js");
const { GenericEvent } = await import("../models/events.model.js");
const { AdminProfile } = await import("../models/adminProfile.model.js");
// The event service populates comments, so that model has to be registered.
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

const OCT30 = "2026-10-30T15:00:00.000Z";
const NOV8 = "2026-11-08T15:00:00.000Z";

// The organizer who owns the event; only they may change it.
let owner;
const makeEvent = async () => {
  const userId = new mongoose.Types.ObjectId();
  const profile = await AdminProfile.create({
    userId,
    firstName: "O",
    lastName: "W",
    phone: "0911",
    email: `o${Date.now()}@example.com`,
    organizationName: "Org",
  });
  owner = userId.toString();
  return GenericEvent.create({
    adminId: profile._id,
    name: "Gospel Praise Concert",
    status: "published",
    links: { venues: { name: "Hall" } },
    dates: {
      start: { dateTime: new Date(OCT30), localDate: "2026-10-30", localTime: "18:00" },
      timezone: "Africa/Addis_Ababa",
      status: { code: "onsale" },
    },
  });
};

// What the edit page sends: dates arrive as a JSON string in a form body.
const save = (event, dates) =>
  new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json() {
        resolve(this.statusCode);
        return this;
      },
    };
    updateEvent(
      {
        params: { eventId: event._id.toString() },
        body: { dates: JSON.stringify(dates) },
        user: { id: owner },
      },
      res,
      reject,
    );
  });

const startOn = (iso, localDate) => ({
  start: { dateTime: iso, localDate, localTime: "18:00" },
  timezone: "Africa/Addis_Ababa",
});

test("postponing saves the new date, the status and the original date", async () => {
  const event = await makeEvent();
  await save(event, {
    ...startOn(NOV8, "2026-11-08"),
    status: { code: "onsale" },
    postponement: { postponed: true },
  });

  const saved = (await GenericEvent.findById(event._id).lean()).dates;
  assert.equal(saved.status.code, "postponed");
  assert.equal(saved.start.localDate, "2026-11-08");
  assert.equal(saved.postponedFrom.localDate, "2026-10-30");
  assert.equal(saved.dateTbd, false);
  assert.equal("postponement" in saved, false);
});

test("a later save from an older edit page does not undo the postponement", async () => {
  const event = await makeEvent();
  await save(event, { ...startOn(NOV8, "2026-11-08"), status: { code: "onsale" }, postponement: { postponed: true } });
  await save(event, { ...startOn(NOV8, "2026-11-08"), status: { code: "onsale" } });

  const saved = (await GenericEvent.findById(event._id).lean()).dates;
  assert.equal(saved.status.code, "postponed");
  assert.equal(saved.postponedFrom.localDate, "2026-10-30");
});

test("putting the event back on sale clears the postponement", async () => {
  const event = await makeEvent();
  await save(event, { ...startOn(NOV8, "2026-11-08"), status: { code: "onsale" }, postponement: { postponed: true } });
  await save(event, { ...startOn(NOV8, "2026-11-08"), status: { code: "onsale" }, postponement: { postponed: false } });

  const saved = (await GenericEvent.findById(event._id).lean()).dates;
  assert.equal(saved.status.code, "onsale");
  assert.equal(saved.postponedFrom, undefined);
});

test("a date still to be announced keeps the old start and is flagged", async () => {
  const event = await makeEvent();
  await save(event, {
    ...startOn(NOV8, "2026-11-08"),
    status: { code: "onsale" },
    postponement: { postponed: true, dateTbd: true },
  });

  const saved = (await GenericEvent.findById(event._id).lean()).dates;
  assert.equal(saved.dateTbd, true);
  assert.equal(saved.start.localDate, "2026-10-30");
});
