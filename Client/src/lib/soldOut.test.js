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

const hours = (n) => new Date(Date.now() + n * 60 * 60 * 1000).toISOString();

test("an event whose start was long ago but whose end is still ahead is not over", () => {
  const dates = { start: { dateTime: hours(-30) }, end: { dateTime: hours(24 * 10) } };
  assert.equal(isEventSoldOut({ dates, tickets: [tier(10)] }), false);
});

test("an event is over once its end has passed", () => {
  const dates = { start: { dateTime: hours(-72) }, end: { dateTime: hours(-1) } };
  assert.equal(isEventSoldOut({ dates, tickets: [tier(10)] }), true);
});

test("an event that never had an end is over 8 hours after it starts", () => {
  const dates = { start: { dateTime: hours(-9) } };
  assert.equal(isEventSoldOut({ dates, tickets: [tier(10)] }), true);
});
