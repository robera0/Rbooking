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
