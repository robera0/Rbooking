import { test } from "node:test";
import assert from "node:assert/strict";
import { backfilledEnd, endNeedsBackfill } from "../utils/backfillEnd.js";

test("the end is the start plus the chosen number of days, in Addis time", () => {
  const end = backfilledEnd("2026-11-13T21:00:00.000Z", 14);
  assert.equal(end.dateTime.toISOString(), "2026-11-27T21:00:00.000Z");
  assert.equal(end.localDate, "2026-11-28");
  assert.equal(end.localTime, "00:00:00");
});

test("only events with a start and no end are touched", () => {
  const start = { dateTime: new Date() };
  assert.equal(endNeedsBackfill({ start }), true);
  assert.equal(endNeedsBackfill({ start, end: { dateTime: new Date() } }), false);
  assert.equal(endNeedsBackfill({ start, end: {} }), true);
  assert.equal(endNeedsBackfill({ start, dateTbd: true }), false);
  assert.equal(endNeedsBackfill({}), false);
  assert.equal(endNeedsBackfill(undefined), false);
});
