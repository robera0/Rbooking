import { test } from "node:test";
import assert from "node:assert/strict";
import { makeGuestName } from "./guestName.js";

test("an auto guest name looks like 'Guest' plus a short code", () => {
  assert.match(makeGuestName(), /^Guest [A-HJ-NP-Z2-9]{4}$/);
});

test("the code only uses letters and digits that are easy to read out loud", () => {
  for (let i = 0; i < 200; i += 1) {
    assert.doesNotMatch(makeGuestName().slice(6), /[01OIL]/);
  }
});

test("names differ between calls", () => {
  const names = new Set(Array.from({ length: 50 }, () => makeGuestName()));
  assert.ok(names.size > 40);
});

test("the random source can be supplied, so the result is predictable", () => {
  assert.equal(makeGuestName(() => 0), "Guest AAAA");
});

import { batchGuestNames, isAutoGuestName } from "./guestName.js";

test("one invitation keeps exactly the name that was typed", () => {
  assert.deepEqual(batchGuestNames("Sara", 1), ["Sara"]);
  assert.deepEqual(batchGuestNames("Guest AB2C", 1), ["Guest AB2C"]);
});

test("an auto name in a batch: the first keeps it, every other guest gets their own", () => {
  const names = batchGuestNames("Guest AB2C", 5);
  assert.equal(names.length, 5);
  assert.equal(names[0], "Guest AB2C");
  assert.equal(new Set(names).size, 5);
  assert.ok(names.every(isAutoGuestName));
});

test("a typed name in a batch is numbered", () => {
  assert.deepEqual(batchGuestNames("Sara", 3), ["Sara 1", "Sara 2", "Sara 3"]);
  assert.deepEqual(batchGuestNames("  The Smiths ", 2), ["The Smiths 1", "The Smiths 2"]);
});

test("a blank name in a batch becomes auto names", () => {
  const names = batchGuestNames("   ", 3);
  assert.equal(new Set(names).size, 3);
  assert.ok(names.every(isAutoGuestName));
});

test("auto names never repeat even when the random source is unlucky", () => {
  const names = batchGuestNames("Guest AAAA", 4, () => 0);
  assert.equal(new Set(names).size, 4);
});

test("only names made by the generator count as auto names", () => {
  assert.equal(isAutoGuestName("Guest AB2C"), true);
  assert.equal(isAutoGuestName("Guest Abebe"), false);
  assert.equal(isAutoGuestName("Sara"), false);
});
