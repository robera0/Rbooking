import { test } from "node:test";
import assert from "node:assert/strict";
import { parseShowAvailability } from "../utils/showAvailability.js";

test("true values", () => {
  for (const v of [true, "true", "TRUE", 1, "1"]) assert.equal(parseShowAvailability(v), true, String(v));
});

test("false values", () => {
  for (const v of [false, "false", "FALSE", 0, "0"]) assert.equal(parseShowAvailability(v), false, String(v));
});

test("missing or unrecognized values leave the setting alone", () => {
  for (const v of [undefined, null, "", "maybe", {}, []]) assert.equal(parseShowAvailability(v), undefined, String(v));
});
