import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

process.env.ACCESS_TOKEN_SECRET ||= "test-secret";

const { default: SuperAdminRouter } = await import(
  "../routes/superAdmin.routes.js"
);

let server;
let base;

before(async () => {
  const app = express();
  app.use(cookieParser());
  app.use("/api/auth/super_admin", SuperAdminRouter);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/auth/super_admin`;
});

after(() => new Promise((resolve) => server.close(resolve)));

const get = (path, role) => {
  const headers = {};
  if (role) {
    const token = jwt.sign(
      { id: "u1", role },
      process.env.ACCESS_TOKEN_SECRET,
    );
    headers.cookie = `accessToken=${token}`;
  }
  return fetch(`${base}${path}`, { headers });
};

for (const path of ["/all_events", "/all_admins"]) {
  test(`${path} refuses a visitor with no login`, async () => {
    assert.equal((await get(path)).status, 401);
  });

  for (const role of ["user", "admin", "club_owner"]) {
    test(`${path} refuses the ${role} role`, async () => {
      assert.equal((await get(path, role)).status, 403);
    });
  }
}
