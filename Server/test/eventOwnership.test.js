import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const { default: eventRouter } = await import("../routes/event.routes.js");
const { default: redisClient } = await import("../config/redis.js");
const { AdminProfile } = await import("../models/adminProfile.model.js");
const { GenericEvent } = await import("../models/events.model.js");
await import("../models/comment.model.js");

let mongo;
let server;
let base;

before(async () => {
  mongo = await startTestMongo();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", eventRouter);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  redisClient.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([AdminProfile.deleteMany({}), GenericEvent.deleteMany({})]);
});

const oid = () => new mongoose.Types.ObjectId();
const cookieFor = (id, role) =>
  `accessToken=${jwt.sign({ id: id.toString(), role }, process.env.ACCESS_TOKEN_SECRET)}`;

let seq = 0;
const makeOrganizer = async () => {
  const userId = oid();
  const profile = await AdminProfile.create({
    userId,
    firstName: "O",
    lastName: "W",
    phone: "0911",
    email: `o${++seq}@example.com`,
    organizationName: "Org",
  });
  return { profile, cookie: cookieFor(userId, "admin") };
};
const makeEvent = (org) =>
  GenericEvent.create({
    adminId: org.profile._id,
    name: "Original name",
    status: "published",
    links: { venues: { name: "Hall" } },
    dates: { start: { dateTime: new Date("2026-10-30T15:00:00Z"), localDate: "2026-10-30", localTime: "18:00" }, status: { code: "onsale" } },
  });

const patch = (event, cookie, body, method = "PATCH") =>
  fetch(
    `${base}${method === "PATCH" ? "/auth" : ""}/admin/events/${event._id}`,
    { method, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) },
  );

const reload = (event) => GenericEvent.findById(event._id).lean();

for (const method of ["PATCH", "PUT"]) {
  test(`${method} update: a visitor is refused`, async () => {
    const event = await makeEvent(await makeOrganizer());
    assert.equal((await patch(event, null, { name: "Hacked" }, method)).status, 401);
    assert.equal((await reload(event)).name, "Original name");
  });

  test(`${method} update: a normal user cannot change an event`, async () => {
    const event = await makeEvent(await makeOrganizer());
    const res = await patch(event, cookieFor(oid(), "user"), { name: "Hacked" }, method);
    assert.equal(res.status, 403);
    assert.equal((await reload(event)).name, "Original name");
  });

  test(`${method} update: another organizer cannot change it, and cannot tell it exists`, async () => {
    const owner = await makeOrganizer();
    const stranger = await makeOrganizer();
    const event = await makeEvent(owner);
    const res = await patch(event, stranger.cookie, { name: "Hacked" }, method);
    assert.equal(res.status, 404);
    assert.equal((await reload(event)).name, "Original name");
  });
}

test("a stranger cannot postpone someone else's event", async () => {
  const event = await makeEvent(await makeOrganizer());
  const stranger = await makeOrganizer();
  await patch(event, stranger.cookie, {
    dates: JSON.stringify({ start: { localDate: "2027-01-01" }, postponement: { postponed: true, dateTbd: true } }),
  });
  assert.equal((await reload(event)).dates.status.code, "onsale");
});

test("the owner can still update their event", async () => {
  const owner = await makeOrganizer();
  const event = await makeEvent(owner);
  const res = await patch(event, owner.cookie, { name: "Renamed" });
  assert.equal(res.status, 200);
  assert.equal((await reload(event)).name, "Renamed");
});
