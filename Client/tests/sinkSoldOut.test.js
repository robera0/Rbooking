import test from "node:test";
import assert from "node:assert/strict";
import { sinkSoldOutEvents } from "../src/lib/soldOut.js";

const future = new Date(Date.now() + 5 * 864e5).toISOString();
const past = new Date(Date.now() - 5 * 864e5).toISOString();
const ev = (name, tickets, date = future) => ({
  name,
  dates: { start: { dateTime: date } },
  tickets,
});
const open = (n = 5) => [{ availableQuantity: n }];
const none = [{ availableQuantity: 0 }, { availableQuantity: 0 }];

test("fully sold out events go last; others keep their order", () => {
  const out = sinkSoldOutEvents([
    ev("sold1", none),
    ev("a", open()),
    ev("sold2", []),
    ev("b", open()),
    ev("c", open()),
  ]).map((e) => e.name);
  assert.deepEqual(out, ["a", "b", "c", "sold1", "sold2"]);
});

test("an event with one sold out tier but another available stays up front", () => {
  const out = sinkSoldOutEvents([
    ev("partial", [{ availableQuantity: 0 }, { availableQuantity: 3 }]),
    ev("sold", none),
  ]).map((e) => e.name);
  assert.deepEqual(out, ["partial", "sold"]);
});

test("finished events sink too, and the input is not mutated", () => {
  const input = [ev("old", open(), past), ev("new", open())];
  const out = sinkSoldOutEvents(input).map((e) => e.name);
  assert.deepEqual(out, ["new", "old"]);
  assert.equal(input[0].name, "old");
});

test("handles empty or missing input", () => {
  assert.deepEqual(sinkSoldOutEvents([]), []);
  assert.deepEqual(sinkSoldOutEvents(undefined), []);
});
