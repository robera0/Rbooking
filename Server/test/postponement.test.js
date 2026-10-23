import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeDatesUpdate } from "../utils/postponement.js";

const OCT30 = { dateTime: new Date("2026-10-30T15:00:00Z"), localDate: "2026-10-30", localTime: "18:00" };
const NOV8 = { dateTime: new Date("2026-11-08T15:00:00Z"), localDate: "2026-11-08", localTime: "18:00" };
const NOV15 = { dateTime: new Date("2026-11-15T15:00:00Z"), localDate: "2026-11-15", localTime: "18:00" };

const onSale = (start) => ({ start, timezone: "Africa/Addis_Ababa", status: { code: "onsale" } });
const postponed = (start, from, extra = {}) => ({
  start,
  timezone: "Africa/Addis_Ababa",
  status: { code: "postponed" },
  postponedFrom: from,
  ...extra,
});

describe("normalizeDatesUpdate", () => {
  test("no dates in the update means no change", () => {
    assert.equal(normalizeDatesUpdate(onSale(OCT30), undefined), undefined);
  });

  test("postponing keeps the original start and takes the new one", () => {
    const result = normalizeDatesUpdate(onSale(OCT30), {
      ...onSale(NOV8),
      postponement: { postponed: true },
    });
    assert.equal(result.status.code, "postponed");
    assert.deepEqual(result.start, NOV8);
    assert.deepEqual(result.postponedFrom, OCT30);
    assert.equal(result.dateTbd, false);
  });

  test("postponing again keeps the very first date as the original", () => {
    const result = normalizeDatesUpdate(postponed(NOV8, OCT30), {
      ...onSale(NOV15),
      postponement: { postponed: true },
    });
    assert.deepEqual(result.start, NOV15);
    assert.deepEqual(result.postponedFrom, OCT30);
  });

  test("a date to be announced keeps the old start untouched", () => {
    const result = normalizeDatesUpdate(onSale(OCT30), {
      ...onSale(NOV8),
      postponement: { postponed: true, dateTbd: true },
    });
    assert.equal(result.dateTbd, true);
    assert.deepEqual(result.start, OCT30);
    assert.deepEqual(result.postponedFrom, OCT30);
  });

  test("putting the event back on sale clears the postponement", () => {
    const result = normalizeDatesUpdate(postponed(NOV8, OCT30), {
      ...onSale(NOV8),
      postponement: { postponed: false },
    });
    assert.equal(result.status.code, "onsale");
    assert.equal(result.postponedFrom, undefined);
    assert.equal(result.dateTbd, undefined);
  });

  test("a save that says nothing about postponement leaves it alone", () => {
    // Older versions of the edit page always send "onsale".
    const result = normalizeDatesUpdate(postponed(NOV8, OCT30), onSale(NOV8));
    assert.equal(result.status.code, "postponed");
    assert.deepEqual(result.postponedFrom, OCT30);
  });

  test("a save that says nothing keeps a not-yet-decided date as it was", () => {
    const existing = postponed(OCT30, OCT30, { dateTbd: true });
    const result = normalizeDatesUpdate(existing, onSale(NOV8));
    assert.equal(result.dateTbd, true);
    assert.deepEqual(result.start, OCT30);
  });

  test("an event that was never postponed passes through unchanged", () => {
    const incoming = onSale(NOV8);
    assert.deepEqual(normalizeDatesUpdate(onSale(OCT30), incoming), incoming);
  });

  test("an empty stored original date counts as none (how the database returns an unset one)", () => {
    const result = normalizeDatesUpdate(
      { ...onSale(OCT30), postponedFrom: {} },
      { ...onSale(NOV8), postponement: { postponed: true } },
    );
    assert.deepEqual(result.postponedFrom, OCT30);
  });

  test("the instruction itself is never stored", () => {
    const result = normalizeDatesUpdate(onSale(OCT30), {
      ...onSale(NOV8),
      postponement: { postponed: true },
    });
    assert.equal("postponement" in result, false);
  });

  test("postponing an event with no stored start has no original date to keep", () => {
    const result = normalizeDatesUpdate(undefined, {
      ...onSale(NOV8),
      postponement: { postponed: true },
    });
    assert.equal(result.postponedFrom, undefined);
    assert.deepEqual(result.start, NOV8);
  });

  test("an update cannot plant a postponement the instruction did not ask for", () => {
    const result = normalizeDatesUpdate(onSale(OCT30), {
      ...onSale(NOV8),
      status: { code: "postponed" },
      postponedFrom: { dateTime: new Date("2020-01-01"), localDate: "2020-01-01" },
      dateTbd: true,
    });
    assert.equal(result.status.code, "onsale");
    assert.equal(result.postponedFrom, undefined);
    assert.equal(result.dateTbd, undefined);
  });

  test("a status code outside the known ones is not stored", () => {
    const result = normalizeDatesUpdate(onSale(OCT30), {
      ...onSale(NOV8),
      status: { code: "<script>alert(1)</script>" },
    });
    assert.equal(result.status.code, "onsale");
  });

  test("cancelled and upcoming codes still pass through", () => {
    assert.equal(normalizeDatesUpdate(onSale(OCT30), { ...onSale(NOV8), status: { code: "cancelled" } }).status.code, "cancelled");
    assert.equal(normalizeDatesUpdate(onSale(OCT30), { ...onSale(NOV8), status: { code: "upcoming" } }).status.code, "upcoming");
  });

  test("postponing without sending a date keeps the date the event has", () => {
    const result = normalizeDatesUpdate(onSale(OCT30), {
      timezone: "Africa/Addis_Ababa",
      status: { code: "onsale" },
      postponement: { postponed: true },
    });
    assert.deepEqual(result.start, OCT30);
  });

  test("a stored postponement cannot be rewritten by sending a different original date", () => {
    const result = normalizeDatesUpdate(postponed(NOV8, OCT30), {
      ...onSale(NOV15),
      postponedFrom: { dateTime: new Date("2020-01-01"), localDate: "2020-01-01" },
      postponement: { postponed: true },
    });
    assert.deepEqual(result.postponedFrom, OCT30);
  });

  test("an empty stored current date counts as none too", () => {
    const result = normalizeDatesUpdate(
      { status: { code: "onsale" }, start: {} },
      { ...onSale(NOV8), postponement: { postponed: true } },
    );
    assert.deepEqual(result.start, NOV8);
  });

  test("an undecided date cannot go straight back on sale with the same old date", () => {
    const existing = postponed(OCT30, OCT30, { dateTbd: true });
    assert.throws(
      () => normalizeDatesUpdate(existing, { ...onSale(OCT30), postponement: { postponed: false } }),
      /new date/i,
    );
  });

  test("an undecided date can go back on sale once a new date is given", () => {
    const existing = postponed(OCT30, OCT30, { dateTbd: true });
    const result = normalizeDatesUpdate(existing, { ...onSale(NOV8), postponement: { postponed: false } });
    assert.equal(result.status.code, "onsale");
    assert.deepEqual(result.start, NOV8);
  });
});

