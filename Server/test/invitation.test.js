import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Invitation } from "../models/invitation.model.js";
import {
  createGuestInvitations,
  checkInInvitation,
  InvitationError,
} from "../service/invitation.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});

const oid = () => new mongoose.Types.ObjectId();

async function makeAdmin() {
  const userId = oid();
  const { insertedId } = await AdminProfile.collection.insertOne({ userId });
  return { userId, profileId: insertedId };
}

async function makeEvent(adminId, { enabled = true, name = "Gala" } = {}) {
  const { insertedId } = await Event.collection.insertOne({
    name,
    type: "generic",
    adminId,
    invitation: { enabled },
  });
  return insertedId.toString();
}

let owner;
let other;
beforeEach(async () => {
  await Promise.all([
    Event.collection.deleteMany({}),
    AdminProfile.collection.deleteMany({}),
    Invitation.deleteMany({}),
  ]);
  owner = await makeAdmin();
  other = await makeAdmin();
});

const failsWith = (promise, status, code) =>
  assert.rejects(
    promise,
    (e) => e instanceof InvitationError && e.status === status && e.code === code,
  );

const guest = { guestName: "Abebe", email: "A@x.com", phone: "0911-22 33" };

// ---- creating ------------------------------------------------------------

test("creates one pass per guest with a shared orderId", async () => {
  const eventId = await makeEvent(owner.profileId);
  const { invitations, orderId, eventName } = await createGuestInvitations(
    eventId,
    owner.userId,
    { ...guest, quantity: 3 },
  );
  assert.equal(invitations.length, 3);
  assert.equal(eventName, "Gala");
  assert.equal(new Set(invitations.map((i) => i.ticketId)).size, 3);
  assert.ok(invitations.every((i) => String(i.orderId) === String(orderId)));
  assert.equal(invitations[0].email, "a@x.com");
  assert.equal(invitations[0].phone, "09112233");
  assert.equal(await Invitation.countDocuments(), 3);
});

test("another organizer cannot create invitations and nothing is created", async () => {
  const eventId = await makeEvent(owner.profileId);
  await failsWith(
    createGuestInvitations(eventId, other.userId, { ...guest, quantity: 1 }),
    403,
    "NOT_YOUR_EVENT",
  );
  assert.equal(await Invitation.countDocuments(), 0);
});

test("legacy events owned by the user id are accepted", async () => {
  const eventId = await makeEvent(owner.userId);
  const r = await createGuestInvitations(eventId, owner.userId, { ...guest, quantity: 1 });
  assert.equal(r.invitations.length, 1);
});

test("user without an admin profile is rejected", async () => {
  const eventId = await makeEvent(owner.profileId);
  await failsWith(
    createGuestInvitations(eventId, oid(), { ...guest, quantity: 1 }),
    403,
    "ADMIN_REQUIRED",
  );
});

test("rejects invalid event, missing event, disabled invitations", async () => {
  await failsWith(createGuestInvitations("nope", owner.userId, guest), 400, "INVALID_EVENT");
  await failsWith(createGuestInvitations(String(oid()), owner.userId, guest), 404, "EVENT_NOT_FOUND");
  const off = await makeEvent(owner.profileId, { enabled: false });
  await failsWith(createGuestInvitations(off, owner.userId, guest), 400, "INVITATIONS_DISABLED");
});

test("validates contact and quantity", async () => {
  const eventId = await makeEvent(owner.profileId);
  await failsWith(
    createGuestInvitations(eventId, owner.userId, { guestName: "x" }),
    400,
    "CONTACT_REQUIRED",
  );
  for (const quantity of [0, 21, 1.5, "abc"]) {
    await failsWith(
      createGuestInvitations(eventId, owner.userId, { ...guest, quantity }),
      400,
      "INVALID_QUANTITY",
    );
  }
  assert.equal(await Invitation.countDocuments(), 0);
});

test("quantity defaults to 1 and name defaults to Guest", async () => {
  const eventId = await makeEvent(owner.profileId);
  const { invitations } = await createGuestInvitations(eventId, owner.userId, { email: "a@x.com" });
  assert.equal(invitations.length, 1);
  assert.equal(invitations[0].guestName, "Guest");
});

// ---- scanning ------------------------------------------------------------

async function makePass(eventId, userId) {
  const { invitations } = await createGuestInvitations(eventId, userId, { ...guest, quantity: 1 });
  return invitations[0].ticketId;
}

test("returns null for tokens that are not invitations", async () => {
  assert.equal(await checkInInvitation("unknown", owner.userId), null);
  assert.equal(await checkInInvitation(undefined, owner.userId), null);
});

test("owner scan checks the guest in once, second scan is 409 and counted", async () => {
  const eventId = await makeEvent(owner.profileId);
  const token = await makePass(eventId, owner.userId);
  const first = await checkInInvitation(token, owner.userId);
  assert.equal(first.status, "ok");
  assert.equal(first.invitation.guestName, "Abebe");
  const second = await checkInInvitation(token, owner.userId);
  assert.equal(second.status, "used");
  const doc = await Invitation.findOne({ ticketId: token });
  assert.equal(doc.scanCount, 2);
  assert.equal(doc.isChecked, true);
});

test("another organizer's scan is refused and does not consume or count", async () => {
  const eventId = await makeEvent(owner.profileId);
  const token = await makePass(eventId, owner.userId);
  await failsWith(checkInInvitation(token, other.userId), 403, "NOT_YOUR_EVENT");
  const doc = await Invitation.findOne({ ticketId: token });
  assert.equal(doc.isChecked, false);
  assert.equal(doc.scanCount, 0);
});

test("unverified invitation is invalid", async () => {
  const eventId = await makeEvent(owner.profileId);
  const token = await makePass(eventId, owner.userId);
  await Invitation.updateOne({ ticketId: token }, { isVerified: false });
  const r = await checkInInvitation(token, owner.userId);
  assert.equal(r.status, "invalid");
});

test("10 concurrent scans give exactly one success", async () => {
  const eventId = await makeEvent(owner.profileId);
  const token = await makePass(eventId, owner.userId);
  const results = await Promise.all(
    Array.from({ length: 10 }, () => checkInInvitation(token, owner.userId)),
  );
  assert.equal(results.filter((r) => r.status === "ok").length, 1);
  assert.equal(results.filter((r) => r.status === "used").length, 9);
});

test("pass whose event was deleted cannot be used", async () => {
  const eventId = await makeEvent(owner.profileId);
  const token = await makePass(eventId, owner.userId);
  await Event.collection.deleteMany({});
  await failsWith(checkInInvitation(token, owner.userId), 403, "NOT_YOUR_EVENT");
});
