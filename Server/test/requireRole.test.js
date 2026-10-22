import { test } from "node:test";
import assert from "node:assert/strict";
import { requireRole } from "../middlewares/requireRole.js";

const run = (user, ...roles) => {
  const res = { statusCode: null, body: null };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  let nexted = false;
  requireRole(...roles)({ user }, res, () => (nexted = true));
  return { res, nexted };
};

test("lets a matching role through", () => {
  const { nexted, res } = run({ id: "1", role: "admin" }, "admin");
  assert.equal(nexted, true);
  assert.equal(res.statusCode, null);
});

test("refuses other roles and missing user with 403", () => {
  for (const user of [{ id: "1", role: "user" }, { id: "1", role: "club_owner" }, { id: "1" }, undefined]) {
    const { nexted, res } = run(user, "admin");
    assert.equal(nexted, false);
    assert.equal(res.statusCode, 403);
  }
});

test("accepts any of several roles", () => {
  assert.equal(run({ role: "club_owner" }, "admin", "club_owner").nexted, true);
});
