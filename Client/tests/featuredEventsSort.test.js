import test from "node:test";
import assert from "node:assert/strict";

import { sortFeaturedEvents } from "../src/lib/featuredEventsSort.js";

const makeEvent = ({
  date,
  tickets = [{ _id: "ticket-1" }],
  name = "Event",
}) => ({
  name,
  dates: { start: { dateTime: date } },
  tickets,
});

test("sortFeaturedEvents keeps available events ahead of sold out, then sorts by date", () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const events = [
    makeEvent({
      date: new Date(now + 15 * dayMs).toISOString(),
      tickets: [],
      name: "Sold out later",
    }),
    makeEvent({
      date: new Date(now + 5 * dayMs).toISOString(),
      name: "Available soon",
    }),
    makeEvent({
      date: new Date(now + 10 * dayMs).toISOString(),
      tickets: [],
      name: "Sold out earlier",
    }),
  ];

  const sorted = sortFeaturedEvents(events);

  assert.deepEqual(
    sorted.map((event) => event.name),
    ["Available soon", "Sold out earlier", "Sold out later"],
  );
});

test("sortFeaturedEvents sorts same-status events by the earliest date first", () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const events = [
    makeEvent({
      date: new Date(now + 20 * dayMs).toISOString(),
      name: "Later date",
    }),
    makeEvent({
      date: new Date(now + 7 * dayMs).toISOString(),
      name: "Earlier date",
    }),
  ];

  const sorted = sortFeaturedEvents(events);

  assert.deepEqual(
    sorted.map((event) => event.name),
    ["Earlier date", "Later date"],
  );
});
