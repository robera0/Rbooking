import { test, before, after, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { startTestMongo } from "./helpers/testMongo.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { GenericEvent } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { ReferralModel } from "../models/referral.model.js";
import {
  createReferral,
  listReferrals,
  referralDetail,
  resolveReferral,
  setReferralActive,
  ReferralError,
} from "../service/referral.service.js";

describe("referrals (database)", () => {
  let mongo;
  before(async () => {
    mongo = await startTestMongo();
    await ReferralModel.init();
  });
  after(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    await Promise.all(
      [AdminProfile, GenericEvent, TicketModel, UserTicketModel, ReferralModel].map((m) =>
        m.deleteMany({}),
      ),
    );
  });

  const oid = () => new mongoose.Types.ObjectId();
  let seq = 0;
  const makeOrganizer = async () => {
    const profile = await AdminProfile.create({
      userId: oid(),
      firstName: "O",
      lastName: "W",
      phone: "0911",
      email: `o${++seq}@example.com`,
      organizationName: "Org",
    });
    const event = await GenericEvent.create({
      adminId: profile._id,
      name: `Jazz ${seq}`,
      status: "published",
      links: { venues: { name: "Hall" } },
    });
    const tier = await TicketModel.create({
      eventId: event._id,
      name: "Regular",
      price: 500,
      totalQuantity: 100,
      availableQuantity: 100,
    });
    return { profile, event, tier };
  };
  const sale = (tier, referral, quantity, userId = oid(), status = "paid") =>
    UserTicketModel.create({
      userId,
      ticketId: tier._id,
      orderNo: `ORD-${++seq}`,
      isVerified: true,
      quantity,
      totalAmount: 500 * quantity,
      status,
      ...(referral && {
        referral: { referralId: referral._id, code: referral.code, name: referral.name },
      }),
    });

  test("creates a code, upper-cased, and refuses a duplicate", async () => {
    const { profile } = await makeOrganizer();
    const r = await createReferral(profile._id, { name: "Abel", code: "abel25" });
    assert.equal(r.code, "ABEL25");
    await assert.rejects(
      () => createReferral(profile._id, { name: "Other", code: "ABEL25" }),
      (e) => e instanceof ReferralError && e.status === 409,
    );
  });

  test("a code can only be limited to the organizer's own event", async () => {
    const a = await makeOrganizer();
    const b = await makeOrganizer();
    await assert.rejects(
      () => createReferral(a.profile._id, { name: "Abel", code: "ABEL", eventId: b.event._id }),
      (e) => e instanceof ReferralError && e.status === 400,
    );
  });

  test("resolveReferral works for the owner's events only, and not once switched off", async () => {
    const a = await makeOrganizer();
    const b = await makeOrganizer();
    const r = await createReferral(a.profile._id, { name: "Abel", code: "ABEL25" });
    assert.equal((await resolveReferral("abel25", a.event._id))?.name, "Abel");
    assert.equal(await resolveReferral("ABEL25", b.event._id), null);
    assert.equal(await resolveReferral("NOPE", a.event._id), null);
    await setReferralActive(a.profile._id, r._id, false);
    assert.equal(await resolveReferral("ABEL25", a.event._id), null);
  });

  test("an event-limited code does not work on the organizer's other events", async () => {
    const a = await makeOrganizer();
    const other = await GenericEvent.create({
      adminId: a.profile._id,
      name: "Second",
      status: "published",
      links: { venues: { name: "Hall" } },
    });
    await createReferral(a.profile._id, { name: "Abel", code: "ONLYONE", eventId: a.event._id });
    assert.ok(await resolveReferral("ONLYONE", a.event._id));
    assert.equal(await resolveReferral("ONLYONE", other._id), null);
  });

  test("lists per-code totals from paid orders only", async () => {
    const a = await makeOrganizer();
    const abel = await createReferral(a.profile._id, { name: "Abel", code: "ABEL25" });
    await createReferral(a.profile._id, { name: "Selam", code: "SELAM" });
    const buyer = oid();
    await sale(a.tier, abel, 2, buyer);
    await sale(a.tier, abel, 3, buyer);
    await sale(a.tier, abel, 1);
    await sale(a.tier, abel, 5, oid(), "pending");
    await sale(a.tier, null, 4);
    const list = await listReferrals(a.profile._id);
    const abelRow = list.find((r) => r.code === "ABEL25");
    assert.deepEqual(abelRow.stats, { tickets: 6, orders: 3, buyers: 2, revenue: 3000 });
    assert.deepEqual(list.find((r) => r.code === "SELAM").stats, {
      tickets: 0,
      orders: 0,
      buyers: 0,
      revenue: 0,
    });
  });

  test("detail shows by-event totals and buyer names only", async () => {
    const a = await makeOrganizer();
    const abel = await createReferral(a.profile._id, { name: "Abel", code: "ABEL25" });
    await sale(a.tier, abel, 2);
    const detail = await referralDetail(a.profile._id, abel._id);
    assert.equal(detail.stats.tickets, 2);
    assert.equal(detail.byEvent.length, 1);
    assert.equal(detail.byEvent[0].eventName, a.event.name);
    assert.deepEqual(Object.keys(detail.recentSales[0]).sort(), [
      "buyer",
      "eventName",
      "purchasedAt",
      "quantity",
    ]);
  });

  test("another organizer cannot read or switch a code", async () => {
    const a = await makeOrganizer();
    const b = await makeOrganizer();
    const abel = await createReferral(a.profile._id, { name: "Abel", code: "ABEL25" });
    await assert.rejects(() => referralDetail(b.profile._id, abel._id), (e) => e.status === 404);
    await assert.rejects(
      () => setReferralActive(b.profile._id, abel._id, false),
      (e) => e.status === 404,
    );
    assert.equal((await listReferrals(b.profile._id)).length, 0);
  });
});

describe("purchase attribution (database)", () => {
  let mongo;
  before(async () => {
    mongo = await startTestMongo();
  });
  after(async () => {
    await mongo.stop();
    const { default: redisClient } = await import("../config/redis.js");
    redisClient.disconnect();
  });

  const oid = () => new mongoose.Types.ObjectId();
  const run = async (tier, body) => {
    const { purchaseTicket } = await import("../controllers/ticket.controller.js");
    let result = { status: 200 };
    const res = {
      status(code) { result.status = code; return this; },
      json(payload) { result.body = payload; return this; },
    };
    await purchaseTicket({ user: { id: String(oid()) }, params: { ticketId: String(tier._id) }, body }, res);
    return result;
  };
  const setup = async () => {
    await Promise.all([AdminProfile, GenericEvent, TicketModel, UserTicketModel, ReferralModel].map((m) => m.deleteMany({})));
    const profile = await AdminProfile.create({ userId: oid(), firstName: "O", lastName: "W", phone: "0911", email: `p${Date.now()}@example.com`, organizationName: "Org" });
    const event = await GenericEvent.create({ adminId: profile._id, name: "Jazz", status: "published", links: { venues: { name: "Hall" } } });
    const tier = await TicketModel.create({ eventId: event._id, name: "Regular", price: 500, totalQuantity: 100, availableQuantity: 100 });
    return { profile, tier };
  };

  test("an order bought with a valid code records who referred it", async () => {
    const { profile, tier } = await setup();
    await createReferral(profile._id, { name: "Abel", code: "ABEL25" });
    const out = await run(tier, { quantity: 2, phone: "+251911", referralCode: "abel25" });
    assert.equal(out.status, 201, JSON.stringify(out.body));
    const saved = await UserTicketModel.findOne({}).lean();
    assert.equal(saved.referral.code, "ABEL25");
    assert.equal(saved.referral.name, "Abel");
  });

  test("a wrong code does not block the purchase and records nobody", async () => {
    const { tier } = await setup();
    const out = await run(tier, { quantity: 1, phone: "+251911", referralCode: "NOPE" });
    assert.equal(out.status, 201, JSON.stringify(out.body));
    const saved = await UserTicketModel.findOne({}).lean();
    assert.equal(saved.referral?.referralId, undefined);
  });
});
