import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isPostponed,
  isDateTbd,
  postponedHeadline,
} from "./postponed.js";
import { isEventPassed8Hours } from "./utils.js";

const DAY = 24 * 60 * 60 * 1000;
const iso = (offsetDays) => new Date(Date.now() + offsetDays * DAY).toISOString();

const event = (dates) => ({ dates });
const postponedTo = (offsetDays, localDate) =>
  event({
    start: { dateTime: iso(offsetDays), localDate, localTime: "18:00:00" },
    status: { code: "postponed" },
    postponedFrom: { dateTime: iso(-3), localDate: "2026-10-30", localTime: "18:00:00" },
    dateTbd: false,
  });
const postponedTbd = () =>
  event({
    start: { dateTime: iso(-3), localDate: "2026-10-30", localTime: "18:00:00" },
    status: { code: "postponed" },
    postponedFrom: { dateTime: iso(-3), localDate: "2026-10-30" },
    dateTbd: true,
  });

test("only an event whose date status is postponed counts as postponed", () => {
  assert.equal(isPostponed(postponedTo(5, "2026-11-08")), true);
  assert.equal(isPostponed(event({ status: { code: "onsale" } })), false);
  assert.equal(isPostponed({}), false);
  assert.equal(isPostponed(undefined), false);
});

test("a date to be announced needs both postponed and the flag", () => {
  assert.equal(isDateTbd(postponedTbd()), true);
  assert.equal(isDateTbd(postponedTo(5, "2026-11-08")), false);
  assert.equal(isDateTbd(event({ status: { code: "onsale" }, dateTbd: true })), false);
});

test("the headline names the new date and says the ticket is still valid", () => {
  const text = postponedHeadline(postponedTo(5, "2026-11-08"), { holder: true });
  assert.match(text, /Postponed/);
  assert.match(text, /Sunday, November 8, 2026/);
  assert.match(text, /still valid/i);
});

test("the headline for an undecided date says it will be announced", () => {
  const text = postponedHeadline(postponedTbd(), { holder: true });
  assert.match(text, /to be announced/i);
  assert.match(text, /still valid/i);
});

test("a visitor who holds no ticket is not told 'your ticket'", () => {
  const text = postponedHeadline(postponedTo(5, "2026-11-08"), { holder: false });
  assert.doesNotMatch(text, /your ticket/i);
});

test("an event with a date to be announced does not look finished", () => {
  assert.equal(isEventPassed8Hours(postponedTbd()), false);
});

test("a postponed event is finished only after its NEW date", () => {
  assert.equal(isEventPassed8Hours(postponedTo(5, "2026-11-08")), false);
});

test("an event that was never postponed is still finished once its date has passed", () => {
  const past = event({
    start: { dateTime: iso(-3), localDate: "2026-10-20", localTime: "18:00:00" },
    status: { code: "onsale" },
  });
  assert.equal(isEventPassed8Hours(past), true);
});
