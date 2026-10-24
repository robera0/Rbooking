import { test } from "node:test";
import assert from "node:assert/strict";
import { isEventSoldOut } from "./soldOut.js";

const DAY = 24 * 60 * 60 * 1000;
const future = { start: { dateTime: new Date(Date.now() + 5 * DAY).toISOString() } };
const past = { start: { dateTime: new Date(Date.now() - 3 * DAY).toISOString() } };
const tier = (availableQuantity) => ({ _id: String(Math.random()), availableQuantity });

test("an event with no ticket types is sold out", () => {
  assert.equal(isEventSoldOut({ dates: future, tickets: [] }), true);
});

test("an event whose ticket list is not loaded is not called sold out", () => {
  assert.equal(isEventSoldOut({ dates: future }), false);
  assert.equal(isEventSoldOut(undefined), false);
});

test("an event that has already happened is sold out", () => {
  assert.equal(isEventSoldOut({ dates: past, tickets: [tier(10)] }), true);
});

test("an event is sold out when every ticket type has no seats left", () => {
  assert.equal(isEventSoldOut({ dates: future, tickets: [tier(0), tier(0)] }), true);
});

test("one ticket type with seats left keeps the event on sale", () => {
  assert.equal(isEventSoldOut({ dates: future, tickets: [tier(0), tier(3)] }), false);
});

test("a ticket type with an unknown seat count is not treated as sold out", () => {
  assert.equal(isEventSoldOut({ dates: future, tickets: [{ _id: "a" }] }), false);
});
