import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Invitation } from "../models/invitation.model.js";
import {
  getOrCreateInvitation,
  recordInvitationScan,
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

// Raw inserts: the real models require many unrelated fields.
async function makeAdmin() {
  const userId = oid();
  const { insertedId } = await AdminProfile.collection.insertOne({ userId });
  return { userId, profileId: insertedId };
}

async function makeEvent(adminProfileId, { enabled = true, name = "Gala" } = {}) {
  const { insertedId } = await Event.collection.insertOne({
    name,
    type: "generic",
    adminId: adminProfileId,
    invitation: { enabled },
  });
  return insertedId.toString();
}

let owner;
let otherAdmin;
beforeEach(async () => {
  await Promise.all([
    Event.collection.deleteMany({}),
    AdminProfile.collection.deleteMany({}),
    Invitation.deleteMany({}),
  ]);
  owner = await makeAdmin();
  otherAdmin = await makeAdmin();
});

const failsWith = (promise, status, code) =>
  assert.rejects(promise, (e) => e instanceof InvitationError && e.status === status && e.code === code);

// ---- creating / reading an invitation --------------------------------------------

test("creates an invitation for the organizer's own event", async () => {
  const eventId = await makeEvent(owner.profileId);
  const { invitation, eventName } = await getOrCreateInvitation(eventId, owner.userId);

  assert.equal(eventName, "Gala");
  assert.match(invitation.ticketId, /^[0-9a-f]{16}$/);
  assert.equal(invitation.adminId.toString(), owner.profileId.toString());
  assert.equal(await Invitation.countDocuments({ eventId }), 1);
});

test("asking again returns the same invitation", async () => {
  const eventId = await makeEvent(owner.profileId);
  const first = await getOrCreateInvitation(eventId, owner.userId);
  const second = await getOrCreateInvitation(eventId, owner.userId);
  assert.equal(second.invitation.ticketId, first.invitation.ticketId);
});

test("simultaneous requests still produce exactly one invitation", async () => {
  const eventId = await makeEvent(owner.profileId);
  const results = await Promise.all(
    Array.from({ length: 10 }, () => getOrCreateInvitation(eventId, owner.userId)),
  );
  assert.equal(new Set(results.map((r) => r.invitation.ticketId)).size, 1);
  assert.equal(await Invitation.countDocuments({ eventId }), 1);
});

test("works for older events that store the user id instead of the profile id", async () => {
  const eventId = await makeEvent(owner.userId);
  const { invitation } = await getOrCreateInvitation(eventId, owner.userId);
  assert.ok(invitation.ticketId);
});

test("another organizer cannot create or read an invitation for the event", async () => {
  const eventId = await makeEvent(owner.profileId);
  await failsWith(getOrCreateInvitation(eventId, otherAdmin.userId), 403, "NOT_YOUR_EVENT");
  assert.equal(await Invitation.countDocuments({}), 0);
});

test("a user without an organizer profile is refused", async () => {
  const eventId = await makeEvent(owner.profileId);
  await failsWith(getOrCreateInvitation(eventId, oid()), 403, "ADMIN_REQUIRED");
});

test("refuses when invitations are not enabled for the event", async () => {
  const eventId = await makeEvent(owner.profileId, { enabled: false });
  await failsWith(getOrCreateInvitation(eventId, owner.userId), 400, "INVITATIONS_DISABLED");
});

test("unknown and malformed event ids", async () => {
  await failsWith(getOrCreateInvitation(oid().toString(), owner.userId), 404, "EVENT_NOT_FOUND");
  await failsWith(getOrCreateInvitation("not-an-id", owner.userId), 400, "INVALID_EVENT");
});

// ---- scanning ------------------------------------------------------------------------

async function invitationFor(adminProfileId = owner.profileId) {
  const eventId = await makeEvent(adminProfileId);
  const { invitation } = await getOrCreateInvitation(eventId, owner.userId);
  return { eventId, token: invitation.ticketId };
}

test("a valid scan returns the invitation with the event name", async () => {
  const { token } = await invitationFor();
  const result = await recordInvitationScan(token, owner.userId);
  assert.equal(result.ticketId, token);
  assert.equal(result.eventId.name, "Gala");
});

test("scans are counted, and a shared invitation can be scanned repeatedly", async () => {
  const { token } = await invitationFor();
  assert.equal((await recordInvitationScan(token, owner.userId)).scanCount, 1);
  await recordInvitationScan(token, owner.userId);
  const third = await recordInvitationScan(token, owner.userId);
  assert.equal(third.scanCount, 3);
  assert.ok(third.lastScannedAt instanceof Date);
});

test("concurrent scans are all counted", async () => {
  const { token } = await invitationFor();
  await Promise.all(Array.from({ length: 15 }, () => recordInvitationScan(token, owner.userId)));
  const stored = await Invitation.findOne({ ticketId: token }).lean();
  assert.equal(stored.scanCount, 15);
});

test("an unknown token is not an invitation", async () => {
  assert.equal(await recordInvitationScan("nope", owner.userId), null);
  assert.equal(await recordInvitationScan("", owner.userId), null);
});

test("an unverified invitation is not accepted", async () => {
  const { token } = await invitationFor();
  await Invitation.updateOne({ ticketId: token }, { isVerified: false });
  assert.equal(await recordInvitationScan(token, owner.userId), null);
});

test("another organizer cannot scan the invitation, and it is not counted", async () => {
  const { token } = await invitationFor();
  await failsWith(recordInvitationScan(token, otherAdmin.userId), 403, "NOT_YOUR_EVENT");
  const stored = await Invitation.findOne({ ticketId: token }).lean();
  assert.equal(stored.scanCount, 0);
});
