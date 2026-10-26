import test from "node:test";
import assert from "node:assert/strict";
import { buildFeaturedRow } from "../src/lib/featuredEventsSort.js";
import { eventRequestPath, withDefaultTicket } from "../src/lib/eventRequest.js";

const future = new Date(Date.now() + 5 * 864e5).toISOString();
const ev = (_id, tickets) => ({ _id, dates: { start: { dateTime: future } }, tickets });
const open = [{ availableQuantity: 3 }];
const none = [{ availableQuantity: 0 }];

test("featured row never contains sold-out events", () => {
  const featured = [ev("a", open), ev("s1", none), ev("b", open)];
  const list = [ev("s2", []), ev("c", open)];
  const row = buildFeaturedRow(featured, list, []).map((e) => e._id);
  assert.deepEqual(row, ["a", "b", "c"]);
});

test("skips hero slides, dedupes and caps at 4", () => {
  const featured = [ev("a", open), ev("b", open), ev("c", open)];
  const list = [ev("b", open), ev("d", open), ev("e", open), ev("f", open)];
  const row = buildFeaturedRow(featured, list, [ev("a", open)]).map((e) => e._id);
  assert.deepEqual(row, ["b", "c", "d", "e"]);
});

test("empty when everything is sold out", () => {
  assert.deepEqual(buildFeaturedRow([ev("s", none)], [ev("t", [])], []), []);
});

test("event request uses the ticket route only when a ticket id exists", () => {
  assert.equal(eventRequestPath("E1", "T1"), "/api/events/E1/tickets/T1");
  for (const bad of [undefined, null, "", "undefined"])
    assert.equal(eventRequestPath("E1", bad), "/api/events/E1", String(bad));
});

test("withDefaultTicket fills the first active ticket, or null", () => {
  const data = { event: {}, tickets: [{ _id: "x", isActive: false }, { _id: "y" }] };
  assert.equal(withDefaultTicket(data).ticket._id, "y");
  assert.equal(withDefaultTicket({ event: {}, tickets: [] }).ticket, null);
  const given = { event: {}, ticket: { _id: "z" }, tickets: [{ _id: "y" }] };
  assert.equal(withDefaultTicket(given).ticket._id, "z");
});
