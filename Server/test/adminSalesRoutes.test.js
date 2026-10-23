import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const { default: adminRouter } = await import("../routes/admin.routes.js");
const { default: redisClient } = await import("../config/redis.js");

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

const get = (path, role) => {
  const headers = {};
  if (role) {
    const token = jwt.sign({ id: "6abd1d2e62fb22d6d806cee4", role }, process.env.ACCESS_TOKEN_SECRET);
    headers.cookie = `accessToken=${token}`;
  }
  return fetch(`${base}${path}`, { headers });
};

// The routes that feed the sales screens each carry their own login and role
// check, instead of relying on another router mounted earlier.
for (const path of ["/events", "/analytics/transactions"]) {
  test(`${path} refuses a visitor with no login`, async () => {
    assert.equal((await get(path)).status, 401);
  });

  test(`${path} refuses a normal user`, async () => {
    assert.equal((await get(path, "user")).status, 403);
  });
}
