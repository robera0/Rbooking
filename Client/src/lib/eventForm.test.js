import test from "node:test";
import assert from "node:assert/strict";
import {
  datePartsFromEvent,
  buildDatesPayload,
  endBeforeStart,
  pushEndWithStart,
  formatDate,
  formatTime,
  timeOptions,
  requiredItems,
  ticketProblems,
} from "./eventForm.js";

// ---- reading an event's dates ------------------------------------------------

test("reads local dates and times, trimming seconds", () => {
  const p = datePartsFromEvent({
    start: { localDate: "2026-11-18", localTime: "19:00:00" },
    end: { localDate: "2026-11-18", localTime: "23:30:00" },
  });
  assert.deepEqual(p, { startD: "2026-11-18", startT: "19:00", endD: "2026-11-18", endT: "23:30" });
});

test("an older event has no end: the end parts are empty strings", () => {
  const p = datePartsFromEvent({ start: { localDate: "2026-11-18", localTime: "19:00" } });
  assert.equal(p.endD, "");
  assert.equal(p.endT, "");
});

test("falls back to the stored UTC time, in Addis time (+3)", () => {
  const p = datePartsFromEvent({ start: { dateTime: "2026-11-18T16:00:00.000Z" } });
  assert.equal(p.startD, "2026-11-18");
  assert.equal(p.startT, "19:00");
});

test("handles a missing or empty dates object", () => {
  for (const d of [undefined, null, {}, { start: {}, end: {} }]) {
    assert.deepEqual(datePartsFromEvent(d), { startD: "", startT: "", endD: "", endT: "" });
  }
});

// ---- building what the server gets ---------------------------------------------

test("builds start and end with the venue's +03:00 offset", () => {
  const d = buildDatesPayload({ startD: "2026-11-18", startT: "19:00", endD: "2026-11-18", endT: "23:00" });
  assert.equal(d.start.localDate, "2026-11-18");
  assert.equal(d.start.localTime, "19:00");
  assert.equal(new Date(d.start.dateTime).toISOString(), "2026-11-18T16:00:00.000Z");
  assert.equal(new Date(d.end.dateTime).toISOString(), "2026-11-18T20:00:00.000Z");
});

test("no end is left out of the payload entirely", () => {
  const d = buildDatesPayload({ startD: "2026-11-18", startT: "19:00", endD: "", endT: "" });
  assert.equal("end" in d, false);
});

test("an unfinished end (date but no time) is left out too", () => {
  const d = buildDatesPayload({ startD: "2026-11-18", startT: "19:00", endD: "2026-11-18", endT: "" });
  assert.equal("end" in d, false);
});

test("an empty start gives a null start time", () => {
  const d = buildDatesPayload({ startD: "", startT: "", endD: "", endT: "" });
  assert.equal(d.start.dateTime, null);
});

// ---- end vs start ---------------------------------------------------------------

test("endBeforeStart is true for equal and earlier ends only", () => {
  const base = { startD: "2026-11-18", startT: "19:00" };
  assert.equal(endBeforeStart({ ...base, endD: "2026-11-18", endT: "19:00" }), true);
  assert.equal(endBeforeStart({ ...base, endD: "2026-11-18", endT: "18:00" }), true);
  assert.equal(endBeforeStart({ ...base, endD: "2026-11-17", endT: "23:00" }), true);
  assert.equal(endBeforeStart({ ...base, endD: "2026-11-18", endT: "19:15" }), false);
  assert.equal(endBeforeStart({ ...base, endD: "2026-11-19", endT: "01:00" }), false);
});

test("endBeforeStart is false while anything is empty", () => {
  assert.equal(endBeforeStart({ startD: "2026-11-18", startT: "19:00", endD: "", endT: "" }), false);
  assert.equal(endBeforeStart({ startD: "", startT: "", endD: "2026-11-18", endT: "10:00" }), false);
});

test("moving the start date past the end date moves the end date along", () => {
  const out = pushEndWithStart({ startD: "2026-11-20", startT: "19:00", endD: "2026-11-18", endT: "23:00" });
  assert.equal(out.endD, "2026-11-20");
  assert.equal(out.endT, "23:00");
});

test("an end that is still after the start is left alone", () => {
  const p = { startD: "2026-11-18", startT: "19:00", endD: "2026-11-19", endT: "02:00" };
  assert.deepEqual(pushEndWithStart(p), p);
});

test("pushEndWithStart does not invent an end", () => {
  const p = { startD: "2026-11-20", startT: "19:00", endD: "", endT: "" };
  assert.deepEqual(pushEndWithStart(p), p);
});

// ---- showing dates ----------------------------------------------------------------

test("formats time as 12 hour", () => {
  assert.equal(formatTime("19:00"), "7:00 PM");
  assert.equal(formatTime("00:15"), "12:15 AM");
  assert.equal(formatTime("12:00"), "12:00 PM");
  assert.equal(formatTime(""), "");
});

test("formats dates, adding the year only when it is not this year", () => {
  const now = new Date("2026-11-13T10:00:00");
  assert.equal(formatDate("2026-11-18", now), "Wed, Nov 18");
  assert.equal(formatDate("2027-01-05", now), "Tue, Jan 5, 2027");
  assert.equal(formatDate("", now), "");
});

test("time options run every 15 minutes through the day", () => {
  const t = timeOptions();
  assert.equal(t.length, 96);
  assert.equal(t[0], "00:00");
  assert.equal(t[95], "23:45");
});

// ---- what is required --------------------------------------------------------------

const full = {
  eventName: "Night",
  startD: "2026-11-18", startT: "19:00", endD: "2026-11-18", endT: "23:00",
  venueName: "Hall", pictureCount: 1, ticketCount: 1,
};
const missing = (form, opts) => requiredItems(form, opts).filter((i) => !i.ok).map((i) => i.key);

test("a complete form has nothing missing", () => {
  assert.deepEqual(missing(full, {}), []);
});

test("each required thing is reported by name", () => {
  assert.deepEqual(missing({ ...full, eventName: "  " }, {}), ["name"]);
  assert.deepEqual(missing({ ...full, startD: "" }, {}), ["start"]);
  assert.deepEqual(missing({ ...full, startT: "" }, {}), ["start"]);
  assert.deepEqual(missing({ ...full, endD: "" }, {}), ["end"]);
  assert.deepEqual(missing({ ...full, venueName: "" }, {}), ["venue"]);
  assert.deepEqual(missing({ ...full, pictureCount: 0 }, {}), ["photo"]);
  assert.deepEqual(missing({ ...full, ticketCount: 0 }, {}), ["ticket"]);
});

test("an older event may leave the end empty", () => {
  assert.deepEqual(missing({ ...full, endD: "", endT: "" }, { legacyNoEnd: true }), []);
});

test("an end before the start counts as a missing end", () => {
  assert.deepEqual(missing({ ...full, endT: "18:00" }, {}), ["end"]);
});

test("while the new date is still to be announced no dates are needed", () => {
  assert.deepEqual(missing({ ...full, startD: "", startT: "", endD: "", endT: "" }, { dateTbd: true }), []);
});

// ---- tickets ---------------------------------------------------------------------

const others = [{ name: "VIP" }, { name: "General  Admission" }];

test("a complete ticket has no problems", () => {
  assert.deepEqual(ticketProblems({ name: "Regular", price: 300, capacity: 50 }, others), {});
  assert.deepEqual(ticketProblems({ name: "Student", price: 0, capacity: "20" }, others), {});
});

test("name, price and seats are all required", () => {
  const p = ticketProblems({ name: " ", price: "", capacity: "" }, others);
  assert.ok(p.name && p.price && p.capacity);
});

test("price must be a number of 0 or more", () => {
  assert.ok(ticketProblems({ name: "A", price: -5, capacity: 5 }, others).price);
  assert.ok(ticketProblems({ name: "A", price: "abc", capacity: 5 }, others).price);
  assert.equal(ticketProblems({ name: "A", price: "0", capacity: 5 }, others).price, undefined);
  assert.equal(ticketProblems({ name: "A", price: 12.5, capacity: 5 }, others).price, undefined);
});

test("seats must be a whole number, not below what is sold", () => {
  assert.ok(ticketProblems({ name: "A", price: 1, capacity: 1.5 }, others).capacity);
  assert.ok(ticketProblems({ name: "A", price: 1, capacity: -1 }, others).capacity);
  assert.ok(ticketProblems({ name: "A", price: 1, capacity: 3, sold: 5 }, others).capacity);
  assert.equal(ticketProblems({ name: "A", price: 1, capacity: 5, sold: 5 }, others).capacity, undefined);
});

test("two tickets cannot share a name (ignoring case and extra spaces)", () => {
  assert.ok(ticketProblems({ name: "vip", price: 1, capacity: 1 }, others).name);
  assert.ok(ticketProblems({ name: "general admission", price: 1, capacity: 1 }, others).name);
});

test("datePartsFromEvent derives a missing local time from dateTime", () => {
  const parts = datePartsFromEvent({
    start: { localDate: "2026-11-18", localTime: "19:00:00" },
    end: { localDate: "2026-11-18", dateTime: "2026-11-18T20:00:00.000Z" },
  });
  assert.equal(parts.endD, "2026-11-18");
  assert.equal(parts.endT, "23:00");
});
