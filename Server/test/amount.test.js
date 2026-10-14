import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, amountsMatch } from "../utils/amount.js";

test("reads amounts the way Telebirr prints them", () => {
  assert.equal(parseAmount("1,400 Birr"), 1400);
  assert.equal(parseAmount("1,400.50 Birr"), 1400.5);
  assert.equal(parseAmount("12,345,678.9 Birr"), 12345678.9);
  assert.equal(parseAmount("700 Birr"), 700);
  assert.equal(parseAmount(" 2 Birr"), 2);
  assert.equal(parseAmount("0.87 Birr"), 0.87);
  assert.equal(parseAmount("0.0 Birr"), 0);
});

test("accepts plain numbers and numeric strings", () => {
  assert.equal(parseAmount(1400), 1400);
  assert.equal(parseAmount("1400"), 1400);
  assert.equal(parseAmount("1400.00"), 1400);
});

test("ignores the currency name in any case or position", () => {
  assert.equal(parseAmount("ETB 1,400"), 1400);
  assert.equal(parseAmount("1,400 etb"), 1400);
  assert.equal(parseAmount("1,400 BIRR"), 1400);
});

test("rejects anything that is not an amount", () => {
  for (const bad of ["", "   ", "abc", "Birr", null, undefined, NaN, Infinity, {}, [], true, "1.2.3", "12 abc 3", "-5 Birr"]) {
    assert.ok(Number.isNaN(parseAmount(bad)), `${JSON.stringify(bad)} should not parse`);
  }
});

test("amounts match when equal to the cent, whatever the format", () => {
  assert.equal(amountsMatch("1,400 Birr", 1400), true);
  assert.equal(amountsMatch("1,400.00 Birr", 1400), true);
  assert.equal(amountsMatch(1400, "1400"), true);
  assert.equal(amountsMatch("1,400 Birr", 1399), false);
  assert.equal(amountsMatch("1 Birr", 1400), false);
});

test("float noise does not break a match", () => {
  assert.equal(amountsMatch("0.30 Birr", 0.1 * 3), true);
  assert.equal(amountsMatch("0.31 Birr", 0.1 * 3), false);
});

test("a missing or unreadable receipt amount never matches", () => {
  assert.equal(amountsMatch(undefined, 1400), false);
  assert.equal(amountsMatch("n/a", 1400), false);
  assert.equal(amountsMatch("1,400 Birr", undefined), false);
});
