import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEventDates } from "../utils/eventDates.js";

const at = (iso) => ({ dateTime: iso, localDate: iso.slice(0, 10), localTime: "18:00" });
const START = at("2026-11-18T16:00:00.000Z");
const GOOD_END = at("2026-11-18T20:00:00.000Z");

const fails = (fn, re) => assert.throws(fn, (e) => e.statusCode === 400 && re.test(e.message));

test("a valid start and end pass", () => {
  assert.doesNotThrow(() => validateEventDates({ start: START, end: GOOD_END }, { requireEnd: true }));
});

test("publishing needs an end date and time", () => {
  fails(() => validateEventDates({ start: START }, { requireEnd: true }), /end/i);
  fails(() => validateEventDates({ start: START, end: {} }, { requireEnd: true }), /end/i);
  fails(() => validateEventDates({ start: START, end: { localDate: "2026-11-18" } }, { requireEnd: true }), /end/i);
  fails(() => validateEventDates(undefined, { requireEnd: true }), /end/i);
});

test("without the requirement, a missing end is fine (drafts and older events)", () => {
  assert.doesNotThrow(() => validateEventDates({ start: START }, { requireEnd: false }));
  assert.doesNotThrow(() => validateEventDates({ start: START, end: {} }, { requireEnd: false }));
  assert.doesNotThrow(() => validateEventDates(undefined, { requireEnd: false }));
});

test("an end that is not after the start is refused", () => {
  fails(() => validateEventDates({ start: START, end: at("2026-11-18T16:00:00.000Z") }, { requireEnd: false }), /after/i);
  fails(() => validateEventDates({ start: START, end: at("2026-11-18T10:00:00.000Z") }, { requireEnd: true }), /after/i);
});

test("an end without a start is refused", () => {
  fails(() => validateEventDates({ end: GOOD_END }, { requireEnd: false }), /start/i);
});

test("garbage dates are refused", () => {
  fails(() => validateEventDates({ start: START, end: { dateTime: "not a date", localDate: "x" } }, { requireEnd: false }), /valid/i);
  fails(() => validateEventDates({ start: { dateTime: "nope" }, end: GOOD_END }, { requireEnd: false }), /valid|start/i);
});

test("dates may arrive as Date objects too", () => {
  assert.doesNotThrow(() =>
    validateEventDates({ start: { dateTime: new Date(START.dateTime) }, end: { dateTime: new Date(GOOD_END.dateTime) } }, { requireEnd: true }),
  );
});

test("the end is not needed while the new date is still to be announced", () => {
  assert.doesNotThrow(() => validateEventDates({ start: START, dateTbd: true }, { requireEnd: true }));
});
