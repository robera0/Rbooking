import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const {
  normalizeCode,
  suggestCode,
  summarizeReferralOrders,
  createReferral,
  ReferralError,
} = await import("../service/referral.service.js");
const { default: adminRouter } = await import("../routes/admin.routes.js");
const { default: redisClient } = await import("../config/redis.js");

test("normalizeCode upper-cases and trims", () => {
  assert.equal(normalizeCode("  abel25 "), "ABEL25");
});

test("normalizeCode rejects short, long and odd characters", () => {
  assert.equal(normalizeCode("ab"), "");
  assert.equal(normalizeCode("A".repeat(21)), "");
  assert.equal(normalizeCode("abel 25"), "");
  assert.equal(normalizeCode("abel$"), "");
  assert.equal(normalizeCode(null), "");
});

test("suggestCode builds a code from the promoter name", () => {
  assert.equal(suggestCode("Abel Tesfaye"), "ABELTESFAY");
  assert.equal(suggestCode("Al"), "");
});

test("summarizeReferralOrders counts tickets, orders, distinct buyers and money", () => {
  const orders = [
    { userId: "u1", quantity: 2, totalAmount: 1000 },
    { userId: "u1", quantity: 1, totalAmount: 500 },
    { userId: "u2", quantity: 3, totalAmount: 1500 },
  ];
  assert.deepEqual(summarizeReferralOrders(orders), {
    tickets: 6,
    orders: 3,
    buyers: 2,
    revenue: 3000,
  });
});

test("createReferral refuses a blank name before touching the database", async () => {
  await assert.rejects(
    () => createReferral("6abd1d2e62fb22d6d806cee4", { name: "  ", code: "ABC" }),
    (e) => e instanceof ReferralError && e.status === 400,
  );
});

test("createReferral refuses an unusable code", async () => {
  await assert.rejects(
    () => createReferral("6abd1d2e62fb22d6d806cee4", { name: "Abel", code: "a!" }),
    (e) => e instanceof ReferralError && e.status === 400,
  );
});

let server;
let base;
before(async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth/admin", adminRouter);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/auth/admin`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  redisClient.disconnect();
});

const call = (method, path, role) => {
  const headers = { "content-type": "application/json" };
  if (role) {
    const token = jwt.sign({ id: "6abd1d2e62fb22d6d806cee4", role }, process.env.ACCESS_TOKEN_SECRET);
    headers.cookie = `accessToken=${token}`;
  }
  return fetch(`${base}${path}`, { method, headers, body: method === "GET" ? undefined : "{}" });
};

test("referral routes need a login", async () => {
  for (const [m, p] of [["GET", "/referrals"], ["POST", "/referrals"], ["GET", "/referrals/abc"], ["PATCH", "/referrals/abc"]]) {
    assert.equal((await call(m, p)).status, 401, `${m} ${p}`);
  }
});

test("referral routes are for organizers only", async () => {
  for (const role of ["user", "club_owner"]) {
    assert.equal((await call("GET", "/referrals", role)).status, 403, role);
    assert.equal((await call("POST", "/referrals", role)).status, 403, role);
  }
});
