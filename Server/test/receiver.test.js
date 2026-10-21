import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { Event } from "../models/events.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import {
  getExpectedReceiver,
  nameMatches,
  nameMatchesAny,
} from "../service/receiver.service.js";

let mongo;
before(async () => {
  mongo = await startTestMongo();
});
after(async () => {
  await mongo.stop();
});

const oid = () => new mongoose.Types.ObjectId();

beforeEach(async () => {
  await Promise.all([Event.collection.deleteMany({}), AdminProfile.collection.deleteMany({})]);
});

async function setup(paymentMethods) {
  const { insertedId: adminId } = await AdminProfile.collection.insertOne({
    userId: oid(),
    paymentMethods,
  });
  const eventId = oid();
  await Event.collection.insertOne({ _id: eventId, name: "E", type: "generic", adminId });
  return { ticketId: { eventId } };
}

const tb = (receiverName, accountNumber = "0911") => ({ provider: "Telebirr", receiverName, accountNumber });

test("returns every Telebirr receiver name, first one as receiverName", async () => {
  const r = await getExpectedReceiver(await setup([tb("Ada"), tb("Bob Kebede"), { provider: "CBE", receiverName: "Zed" }]));
  assert.deepEqual(r.receiverNames, ["Ada", "Bob Kebede"]);
  assert.equal(r.receiverName, "Ada");
});

test("skips Telebirr entries without a name; errors when none has one", async () => {
  const ok = await getExpectedReceiver(await setup([tb(""), tb("Bob")]));
  assert.deepEqual(ok.receiverNames, ["Bob"]);
  const none = await getExpectedReceiver(await setup([tb("")]));
  assert.equal(none.status, 400);
});

test("nameMatchesAny accepts a receipt for any configured receiver", () => {
  const names = ["Ada", "Bob Kebede"];
  assert.equal(nameMatchesAny("Ada", names), true);
  assert.equal(nameMatchesAny("Bob", names), true);
  assert.equal(nameMatchesAny("Zed", names), false);
  assert.equal(nameMatchesAny("Ada", []), false);
  assert.equal(nameMatchesAny("", names), false);
});

test("nameMatches behaviour is unchanged", () => {
  assert.equal(nameMatches("Nahom", "Nahom Abebe"), true);
  assert.equal(nameMatches("Nahom", "Abebe"), false);
});
